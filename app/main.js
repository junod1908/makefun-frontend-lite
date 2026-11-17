import {render as board} from './view-board.js';
import {timeLeft,esc} from './format.js';
const main=document.querySelector('#app');
let navigation=0;
async function route() {
  const token=++navigation;
  const active=()=>token===navigation;
  window.__shotReady=false;
  main.innerHTML='<p class="loading" role="status">Loading…</p>';
  try {
    const parts=location.hash.slice(1).split('/').filter(Boolean).map(decodeURIComponent);
    if(parts[0]==='bounty' && parts[1] && parts.length===3 && parts[2]==='leaderboard') {
      const view=await import('./view-leaderboard.js'); if(active()) await view.render(main,parts[1],active);
    } else if(parts[0]==='bounty' && parts[1] && parts.length===2) {
      const view=await import('./view-bounty.js'); if(active()) await view.render(main,parts[1],active);
    } else if(parts[0]==='profile' && parts[1] && parts.length===2) {
      const view=await import('./view-profile.js'); if(active()) await view.render(main,parts[1],active);
    } else await board(main,active);
  } catch(error) {
    if(active()) main.innerHTML=`<section class="empty"><h1>Couldn’t load this page</h1><p>${esc(error.message)}. Please try again.</p><button id="retry">Try again</button> <a href="#/">Bounty board</a></section>`;
    main.querySelector('#retry')?.addEventListener('click',route);
  } finally { if(active()) { window.__shotReady=true; } }
}
window.addEventListener('hashchange',route);
document.querySelector('#profile-search').addEventListener('submit',event=>{
  event.preventDefault(); const handle=new FormData(event.currentTarget).get('handle').trim().replace(/^@/,'');
  if(handle) location.hash='/profile/'+encodeURIComponent(handle);
});
setInterval(()=>{
  document.querySelectorAll('[data-deadline]').forEach(element=>{
    element.textContent=timeLeft(element.dataset.deadline);
    element.classList.toggle('closed',element.textContent==='Closed');
  });
},30000);
route();
