import {getCompetition} from './api.js';
import {money,timeLeft,dateTime,esc} from './format.js';
function markdown(text) {
  const inline = s => s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
  const lines = esc(text).replace(/\r/g,'').split('\n');
  let html = '', paragraph = [], list = [];
  function flush() {
    if (paragraph.length) html += '<p>'+inline(paragraph.join(' '))+'</p>';
    if (list.length) html += '<ul>'+list.map(s=>'<li>'+inline(s)+'</li>').join('')+'</ul>';
    paragraph=[]; list=[];
  }
  for (const line of lines) {
    const heading = /^(#{1,3}) (.*)$/.exec(line);
    if (!line.trim()) flush();
    else if (heading) { flush(); const n=heading[1].length+1; html+=`<h${n}>${inline(heading[2])}</h${n}>`; }
    else if (line.startsWith('- ')) { if(paragraph.length) flush(); list.push(line.slice(2)); }
    else { if(list.length) flush(); paragraph.push(line); }
  }
  flush(); return html;
}
export async function render(main, slug, active = () => true) {
  const b = await getCompetition(slug);
  if (!active()) return;
  const now = Array.isArray(b.rewardsNow) && b.rewardsNow.length > 0;
  const pot = b.potUsd ?? b.rewardAmount;
  const rows = now ? b.rewardsNow.map(r=>`<tr><td>#${esc(r.place)}</td><td>${money(r.baseUsd)}</td><td>${money(r.feeShareUsd)}</td><td><strong>${money(r.amountUsd)}</strong></td></tr>`).join('') : Object.entries(b.rewards || {}).sort((a,b)=>Number(a[0])-Number(b[0])).map(([place,amount])=>`<tr><td>#${esc(place)}</td><td>${money(amount)}</td></tr>`).join('');
  main.innerHTML = `<a class="back" href="#/">← All bounties</a><section class="intro"><p class="eyebrow">${esc(b.category)} · BOUNTY</p><h1>${esc(b.title)}</h1><p>${esc(b.summary)}</p><span class="countdown bounty-status ${timeLeft(b.deadline)==='Closed'?'closed':''}" data-deadline="${esc(b.deadline)}">${timeLeft(b.deadline)}</span></section><div class="stat-strip"><div><strong>${money(pot)}</strong><span>${b.potUsd != null?'Live pot':'Reward'}</span></div>${b.entryFeeUsd != null?`<div><strong>${money(b.entryFeeUsd)}</strong><span>Entry fee</span></div>`:''}<div><strong>${esc(b.submissionCount)}</strong><span>Entries</span></div><div><strong class="date">${esc(dateTime(b.opensAt))}</strong><span>Opens</span></div><div><strong class="date">${esc(dateTime(b.deadline))}</strong><span>Deadline</span></div></div><div class="detail-grid"><section class="prose"><h2>The challenge</h2>${markdown(b.description)}<details><summary>Full competition rules</summary><div id="rules"></div></details></section><aside><section class="panel"><p class="eyebrow">THE REWARDS</p><h2>Make your mark.</h2><div class="table-wrap"><table><thead><tr><th>Place</th>${now?'<th>Base</th><th>Fee share</th><th>Total</th>':'<th>Amount</th>'}</tr></thead><tbody>${rows}</tbody><tfoot><tr><th colspan="${now?3:1}">Total pot</th><td>${money(pot)}</td></tr></tfoot></table></div><a class="button" href="#/bounty/${encodeURIComponent(slug)}/leaderboard">View leaderboard →</a></section></aside></div>`;
  const details=main.querySelector('details');
  function reveal() { if(details.open) { main.querySelector('#rules').innerHTML=markdown(b.rules); details.removeEventListener('toggle',reveal); } }
  details.addEventListener('toggle',reveal);
}
