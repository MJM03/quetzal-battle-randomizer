/* V37 — GIF animado forzado en EQUIPOS SORTEADOS */
(function(){
  const BASE='https://play.pokemonshowdown.com/sprites/ani/';
  const FALLBACK='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
  function slug(raw){return String(raw||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-')}
  function idFrom(img){return Number(img.dataset.pokemonId||0)||0}
  function nameFrom(img){return slug(img.dataset.pokemonName||img.alt||img.closest('.pokemon-card')?.querySelector('.name')?.textContent||'')}
  function animate(img){
    if(!(img instanceof HTMLImageElement))return;
    const card=img.closest('.pokemon-card');
    if(!card)return;
    const name=nameFrom(img),id=idFrom(img); if(!name)return;
    let overlay=card.querySelector(':scope > .qbr37-gif');
    if(!overlay){overlay=document.createElement('img');overlay.className='qbr37-gif';overlay.alt=img.alt||'';overlay.setAttribute('aria-hidden','true');card.appendChild(overlay)}
    const src=BASE+name+'.gif';
    if(overlay.dataset.src!==src){overlay.dataset.src=src;overlay.onerror=function(){this.onerror=null;if(id)this.src=FALLBACK+id+'.png'};overlay.src=src}
    img.style.visibility='hidden';
  }
  function scan(root=document){root.querySelectorAll?.('.pokemon-card img').forEach(animate)}
  function boot(){
    scan();
    new MutationObserver(()=>requestAnimationFrame(()=>scan())).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src','alt','data-pokemon-id','data-pokemon-name']});
    setInterval(scan,700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
