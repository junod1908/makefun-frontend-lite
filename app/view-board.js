import {listCompetitions} from './api.js';
import {money, timeLeft, esc} from './format.js';
export async function render(main, active = () => true) {
  const items = [];
  let cursor;
  const seen = new Set();
  do {
    const page = await listCompetitions(cursor);
    items.push(...page.items);
    cursor = page.next_cursor;
    if (seen.has(cursor)) break;
    seen.add(cursor);
  } while (cursor);
  if (!active()) return;
  const live = items.filter(b => new Date(b.deadline) > Date.now());
  main.innerHTML = `<section class="intro"><p class="eyebrow">BUILD SOMETHING THAT WINS</p><h1>The bounty board<span class="accent">.</span></h1><p>Find your next challenge. Make something great. Get rewarded.</p></section><div class="stat-strip"><div><strong>${live.length}</strong><span>Live bounties</span></div><div><strong>${money(live.reduce((sum,b) => sum + Number(b.potUsd ?? b.rewardAmount),0))}</strong><span>Up for grabs</span></div><div><strong>One good idea</strong><span>Is all it takes to start</span></div></div><div class="toolbar"><label>Search bounties<input id="search" type="search" placeholder="Title, category, or skill…"></label><label>Sort by<select id="sort"><option value="deadline">Ending soon</option><option value="pot">Biggest pot</option><option value="entries">Most entries</option></select></label></div><div id="cards" class="cards"></div><p id="result-count" class="muted"></p>`;
  const search = main.querySelector('#search'), sort = main.querySelector('#sort');
  function draw() {
    const term = search.value.toLowerCase();
    const rows = items.filter(b => [b.title,b.category,...(b.skills || [])].join(' ').toLowerCase().includes(term));
    rows.sort((a,b) => {
      const closed = x => new Date(x.deadline) <= Date.now();
      return Number(closed(a))-Number(closed(b)) || (sort.value === 'pot' ? Number(b.potUsd ?? b.rewardAmount)-Number(a.potUsd ?? a.rewardAmount) : sort.value === 'entries' ? b.submissionCount-a.submissionCount : new Date(a.deadline)-new Date(b.deadline));
    });
    main.querySelector('#cards').innerHTML = rows.map(b => `<article class="card"><div class="card-top"><span class="eyebrow">${esc(b.category)}</span><span class="countdown ${timeLeft(b.deadline)==='Closed'?'closed':''}" data-deadline="${esc(b.deadline)}">${timeLeft(b.deadline)}</span></div><h2><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a></h2><p class="summary">${esc(b.summary)}</p><div class="chips">${(b.skills || []).map(s=>`<span>${esc(s)}</span>`).join('')}</div><div class="card-bottom"><div><span class="muted">${b.potUsd != null ? 'Live pot' : 'Reward'}</span><strong class="prize">${money(b.potUsd ?? b.rewardAmount)}</strong></div><div class="card-meta">${b.entryFeeUsd != null ? `<span class="fee">Entry fee ${money(b.entryFeeUsd)}</span>` : ''}<span>${esc(b.submissionCount)} entries</span></div></div></article>`).join('') || '<p class="empty">No bounties match your search.</p>';
    main.querySelector('#result-count').textContent = `${rows.length} bounties shown`;
  }
  search.addEventListener('input',draw); sort.addEventListener('change',draw); draw();
}
