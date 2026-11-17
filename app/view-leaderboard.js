import {getLeaderboard} from './api.js';
import {esc,rate} from './format.js';
export async function render(main,slug,active=()=>true) {
  const data=await getLeaderboard(slug);
  if(!active()) return;
  const columns=data.columns.filter(c=>c.hidden!==true);
  main.innerHTML=`<a class="back" href="#/bounty/${encodeURIComponent(slug)}">← Bounty details</a><section class="intro"><p class="eyebrow">THE PEOPLE MAKING IT HAPPEN</p><h1>Leaderboard<span class="accent">.</span></h1><p>${esc(data.title)}</p></section><div class="table-wrap panel"><table class="leaderboard"><thead><tr><th>Rank</th><th>Entrant</th><th>Entry</th>${columns.map(c=>`<th>${esc(c.title)}</th>`).join('')}</tr></thead><tbody></tbody></table></div><div class="pagination"><p id="showing" role="status"></p><button id="more">Show more</button></div>`;
  let count=0;
  function metric(entry,key) {
    const value=entry.values?.[key];
    if(value==null) return esc(entry.display?.[key] ?? '—');
    if(key===data.rank_key || /_(low|high)$/.test(key)) return rate(value);
    if(key==='bytes') return (Number(value)/1024).toFixed(1)+' KB';
    if(key==='valid') return Number(value)===1?'Yes':'—';
    return esc(entry.display?.[key] ?? value);
  }
  function more() {
    const end=Math.min(count+50,data.entries.length);
    main.querySelector('tbody').insertAdjacentHTML('beforeend',data.entries.slice(count,end).map(e=>`<tr><td class="rank">${esc(e.rank)}</td><td class="entrant-cell"><a class="entrant" href="#/profile/${encodeURIComponent(e.handle)}">${e.image?`<img src="https://make.fun${esc(e.image)}" crossorigin="anonymous" loading="lazy" width="28" height="28" alt="">`:''}@${esc(e.handle)}</a></td><td class="entry-cell">${esc(e.title)}</td>${columns.map(c=>`<td>${metric(e,c.key)}</td>`).join('')}</tr>`).join(''));
    count=end; main.querySelector('#showing').textContent=`Showing ${count} of ${data.entries.length}`; main.querySelector('#more').hidden=count===data.entries.length;
  }
  main.querySelector('#more').addEventListener('click',more); more();
}
