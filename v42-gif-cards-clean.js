/* V42 — GIFs solo para EQUIPOS SORTEADOS; no interfiere con las demás ruletas */
(function(){
  const BASE='https://play.pokemonshowdown.com/sprites/ani/';
  function slug(raw){
    let s=String(raw||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    s=s.replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-');
    s=s.replace(/^mega-(.+)-(x|y)$/,'$1-mega-$2').replace(/^mega-(.+)$/,'$1-mega').replace(/^primal-(.+)$/,'$1-primal');
    return s;
  }
  function arm(img){
    if(!(img instanceof HTMLImageElement))return;
    const card=img.closest('#teams .pokemon-card');
    if(!card)return;
    const name=slug(img.alt||card.querySelector('.name')?.textContent||'');
    if(!name)return;
    const gif=BASE+name+'.gif';
    if(img.dataset.qbr42===gif)return;
    const original=img.src;
    img.dataset.qbr42=gif;
    img.onerror=function(){img.onerror=null;if(original)img.src=original};
    img.src=gif;
  }
  function scan(){document.querySelectorAll('#teams .pokemon-card>img:first-child').forEach(arm)}
  function boot(){
    const teams=document.getElementById('teams');if(!teams)return;
    scan();
    new MutationObserver(()=>requestAnimationFrame(scan)).observe(teams,{childList:true,subtree:true});
    setInterval(scan,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
