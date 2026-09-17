/* V40 — GIF directo en el sprite de EQUIPOS SORTEADOS, sin overlays */
(function(){
  const BASE='https://play.pokemonshowdown.com/sprites/ani/';
  const HOME='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
  function slug(raw){
    let s=String(raw||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    s=s.replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-');
    s=s.replace(/^mega-(.+)-(x|y)$/,'$1-mega-$2').replace(/^mega-(.+)$/,'$1-mega').replace(/^primal-(.+)$/,'$1-primal');
    return s;
  }
  function arm(card){
    const img=card?.querySelector(':scope > img');
    if(!img||img.dataset.qbrV40==='1')return;
    const name=slug(img.alt||card.querySelector('.name')?.textContent||'');
    if(!name)return;
    const gif=BASE+name+'.gif';
    img.dataset.qbrV40='1';
    img.dataset.qbrV40Gif=gif;
    img.dataset.qbrV40Fallback=img.src||'';
    img.onerror=function(){
      img.onerror=null;
      const id=(img.dataset.pokemonId||'').match(/^\d+$/)?.[0];
      if(id)img.src=HOME+id+'.png';
      else if(img.dataset.qbrV40Fallback)img.src=img.dataset.qbrV40Fallback;
    };
    img.src=gif;
  }
  function scan(){document.querySelectorAll('#teams .pokemon-card').forEach(arm)}
  function boot(){
    scan();
    const teams=document.getElementById('teams')||document.documentElement;
    new MutationObserver(()=>requestAnimationFrame(scan)).observe(teams,{childList:true,subtree:true});
    setInterval(scan,700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
