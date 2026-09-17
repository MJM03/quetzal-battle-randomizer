/* V42 — reparación definitiva de EQUIPOS SORTEADOS */
(function(){
  const BASE='https://play.pokemonshowdown.com/sprites/ani/';
  function slug(raw){
    let s=String(raw||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    s=s.replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-');
    s=s.replace(/^mega-(.+)-(x|y)$/,'$1-mega-$2').replace(/^mega-(.+)$/,'$1-mega').replace(/^primal-(.+)$/,'$1-primal');
    return s;
  }
  function cleanOldCss(){
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link=>{
      const h=link.getAttribute('href')||'';
      if(/v38-team-card-gifs|v40-team-card-gifs|v41-team-card-fix/.test(h))link.remove();
    });
    document.querySelectorAll('#teams .pokemon-card .qbr-team-card-gif').forEach(n=>n.remove());
    if(document.getElementById('qbr-v42-card-style'))return;
    const style=document.createElement('style');
    style.id='qbr-v42-card-style';
    style.textContent=`
      #teams .pokemon-card{position:relative!important;min-width:0!important;display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;gap:7px!important;align-items:center!important;overflow:hidden!important}
      #teams .pokemon-card>img:first-child{grid-column:1!important;grid-row:1!important;width:44px!important;height:44px!important;max-width:44px!important;max-height:44px!important;object-fit:contain!important;display:block!important}
      #teams .pokemon-card>.pokemon-info{grid-column:2!important;grid-row:1!important;min-width:0!important;width:auto!important;display:block!important}
      #teams .pokemon-card>.mini{position:absolute!important;right:4px!important;top:4px!important;width:24px!important;height:24px!important}
      #teams .pokemon-card .name{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #teams .pokemon-card .meta{display:block!important}
    `;
    document.head.appendChild(style);
  }
  function arm(img){
    if(!(img instanceof HTMLImageElement))return;
    const card=img.closest('#teams .pokemon-card');if(!card)return;
    const name=slug(img.alt||card.querySelector('.name')?.textContent||'');if(!name)return;
    const gif=BASE+name+'.gif';
    if(img.dataset.qbrV42===gif)return;
    const original=img.src;
    img.dataset.qbrV42=gif;
    img.onerror=function(){img.onerror=null;if(original)img.src=original};
    img.src=gif;
  }
  function scan(){cleanOldCss();document.querySelectorAll('#teams .pokemon-card>img:first-child').forEach(arm)}
  function boot(){
    scan();
    const teams=document.getElementById('teams');if(!teams)return;
    new MutationObserver(()=>requestAnimationFrame(scan)).observe(teams,{childList:true,subtree:true});
    setInterval(scan,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
