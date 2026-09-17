/* V43 — tarjetas de Pokémon legibles + GIF animado */
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
    let style=document.getElementById('qbr-v43-card-style');
    if(!style){
      style=document.createElement('style');style.id='qbr-v43-card-style';document.head.appendChild(style);
    }
    style.textContent=`
      #teams .pokemon-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
      #teams .pokemon-card{position:relative!important;min-width:0!important;min-height:76px!important;display:grid!important;grid-template-columns:50px minmax(0,1fr)!important;gap:8px!important;align-items:center!important;padding:8px!important;overflow:hidden!important}
      #teams .pokemon-card>img:first-child{grid-column:1!important;grid-row:1!important;width:50px!important;height:50px!important;max-width:50px!important;max-height:50px!important;object-fit:contain!important;display:block!important}
      #teams .pokemon-card>.pokemon-info{grid-column:2!important;grid-row:1!important;min-width:0!important;width:100%!important;display:block!important;padding:0 34px 0 0!important;overflow:hidden!important}
      #teams .pokemon-card .name{display:block!important;width:100%!important;max-width:100%!important;margin:0!important;padding:0!important;font-size:.73rem!important;line-height:1.15!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #teams .pokemon-card .meta{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:4px!important;width:100%!important;margin-top:5px!important;font-size:.61rem!important;line-height:1.2!important;white-space:normal!important;overflow:visible!important}
      #teams .pokemon-card .dex{display:inline-flex!important;align-items:center!important;white-space:nowrap!important}
      #teams .pokemon-card .generation-badge{position:absolute!important;right:36px!important;top:8px!important;margin:0!important;padding:2px 5px!important;font-size:.46rem!important;line-height:1.1!important;white-space:nowrap!important;z-index:3!important}
      #teams .pokemon-card>.mini{position:absolute!important;right:5px!important;top:5px!important;width:27px!important;height:27px!important;min-width:27px!important;padding:0!important;z-index:5!important}
      @media(max-width:650px){
        #teams .pokemon-grid{grid-template-columns:1fr!important;gap:8px!important}
        #teams .pokemon-card{min-height:80px!important;grid-template-columns:58px minmax(0,1fr)!important;padding:9px!important;gap:9px!important}
        #teams .pokemon-card>img:first-child{width:58px!important;height:58px!important;max-width:58px!important;max-height:58px!important}
        #teams .pokemon-card>.pokemon-info{padding-right:44px!important}
        #teams .pokemon-card .name{font-size:.82rem!important;line-height:1.2!important}
        #teams .pokemon-card .meta{font-size:.65rem!important;margin-top:5px!important}
        #teams .pokemon-card .generation-badge{right:40px!important;top:9px!important;font-size:.49rem!important}
        #teams .pokemon-card>.mini{right:6px!important;top:6px!important;width:29px!important;height:29px!important;min-width:29px!important}
      }
    `;
  }
  function arm(img){
    if(!(img instanceof HTMLImageElement))return;
    const card=img.closest('#teams .pokemon-card');if(!card)return;
    const name=slug(img.alt||card.querySelector('.name')?.textContent||'');if(!name)return;
    const gif=BASE+name+'.gif';
    if(img.dataset.qbrV43===gif)return;
    const original=img.src;
    img.dataset.qbrV43=gif;
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
