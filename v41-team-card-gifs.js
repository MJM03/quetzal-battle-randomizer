/* V41 — GIF directo sobre el sprite original, sin cambiar la estructura de la tarjeta */
(function(){
  const BASE='https://play.pokemonshowdown.com/sprites/ani/';
  function slug(raw){let s=String(raw||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'');s=s.replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-');s=s.replace(/^mega-(.+)-(x|y)$/,'$1-mega-$2').replace(/^mega-(.+)$/,'$1-mega').replace(/^primal-(.+)$/,'$1-primal');return s}
  function arm(img){
    if(!(img instanceof HTMLImageElement)||img.dataset.qbr41==='1')return;
    const card=img.closest('.pokemon-card'); if(!card)return;
    const name=slug(img.alt||card.querySelector('.name')?.textContent||''); if(!name)return;
    const gif=BASE+name+'.gif';
    img.dataset.qbr41='1'; img.dataset.qbr41Gif=gif;
    const original=img.src;
    img.onerror=function(){img.onerror=null;img.src=original};
    img.src=gif;
  }
  function scan(root=document){
    root.querySelectorAll?.('#teams .pokemon-card>img:first-child').forEach(arm);
    if(root instanceof HTMLImageElement)arm(root);
  }
  function boot(){
    const teams=document.getElementById('teams'); if(!teams)return;
    scan(teams);
    new MutationObserver(()=>requestAnimationFrame(()=>scan(teams))).observe(teams,{childList:true,subtree:true});
    setInterval(()=>scan(teams),1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
