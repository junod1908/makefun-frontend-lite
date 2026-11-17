import {getProfile} from './api.js';
import {esc,money,shortDate} from './format.js';
function safeLink(url) { try { const u=new URL(url); return ['https:','http:'].includes(u.protocol)?esc(u.href):'#'; } catch { return '#'; } }
export async function render(main,handle,active=()=>true) {
  let p;
  try { p=await getProfile(handle); } catch(error) { if(error.status!==404) throw error; if(active()) main.innerHTML=`<section class="intro"><h1>No profile for @${esc(handle)}</h1><p>Check the handle and try another search.</p><a href="#/">Back to the board →</a></section>`; return; }
  if(!active()) return;
  const image=p.image || p.avatar?.url;
  const r=p.record || {};
  const stats=[['Entered',r.competitions_entered],['Placed',r.competitions_placed],['Won',r.competitions_won],['Podiums',r.podium_finishes],['Best placement',r.best_placement!=null?'#'+r.best_placement:'—'],['Total prizes',money(r.prize_usd ?? 0)]];
  main.innerHTML=`<a class="back" href="#/">← Bounty board</a><section class="intro profile">${image?`<img class="avatar" src="${esc(image.startsWith('/')?'https://make.fun'+image:image)}" crossorigin="anonymous" width="88" height="88" alt="">`:''}<div><p class="eyebrow">MAKER PROFILE</p><h1>${esc(p.display_name || p.handle)}</h1><p>@${esc(p.handle)}</p></div></section><p class="bio">${esc(p.bio)}</p><div class="social"><span>Joined ${esc(shortDate(p.joined_at))}</span>${p.github_login?`<a href="https://github.com/${encodeURIComponent(p.github_login)}">GitHub ↗</a>`:''}${p.discord?`<a href="${safeLink(p.discord.url)}">Discord ↗</a>`:''}${p.x?`<a href="${safeLink(p.x.url)}">X ↗</a>`:''}</div><div class="stats-grid">${stats.map(([label,value])=>`<div><strong>${esc(value ?? 0)}</strong><span>${label}</span></div>`).join('')}</div><h2>Recent entries</h2><ul class="entries">${p.solutions.map(s=>`<li><div><a href="#/bounty/${encodeURIComponent(s.competition.slug)}">${esc(s.competition.title)}</a><h3>${esc(s.title)}</h3><span class="muted">${esc(shortDate(s.entered_at))}</span></div><div class="entry-result">${s.placement!=null?`<strong>#${esc(s.placement)}</strong>`:''}${s.prize_usd!=null?`<span>${money(s.prize_usd)}</span>`:''}${s.score?.display && s.score.display!=='n/a'?`<span>${esc(s.score.display)}</span>`:''}</div></li>`).join('') || '<li>No recent entries yet.</li>'}</ul>`;
}
