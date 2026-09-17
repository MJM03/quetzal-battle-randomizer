/* V38 — GIF independiente para EQUIPOS SORTEADOS */
(function(){
  const BASE='https://play.pokemonshowdown.com/sprites/ani/';
  const HOME='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
  function slug(raw){
    let s=String(raw||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    s=s.replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-');
    s=s.replace(/^mega-(.+)-(x|y)$/,'$1-mega-$2').replace(/^mega-(.+)$/,'$1-mega').replace(/^primal-(.+)$/,'$1-primal');
    return s;
  }
  function install(card){
    if(!card || card.dataset.qbrCardGif==='1')return;
    const original=card.querySelector(':scope > img');
    if(!original)return;
    const name=slug(original.alt||card.querySelector('.name')?.textContent||original.dataset.pokemonName||'');
    const id=Number(original.dataset.pokemonId||0);
    if(!name)return;
    card.dataset.qbrCardGif='1';
    if(getComputedStyle(card).position==='static')card.style.position='relative';
    const gif=document.createElement('img');
    gif.className='qbr-team-card-gif';
    gif.alt='';gif.setAttribute('aria-hidden','true');gif.loading='eager';gif.decoding='async';gif.draggable=false;
    gif.src=BASE+name+'.gif';
    gif.onerror=function(){gif.onerror=null;if(id)gif.src=HOME+id+'.png';};
    card.appendChild(gif);
  }
  function scan(){document.querySelectorAll('#teams .pokemon-card').forEach(install)}
  function boot(){
    scan();
    new MutationObserver(()=>requestAnimationFrame(scan)).observe(document.getElementById('teams')||document.documentElement,{childList:true,subtree:true});
    setInterval(scan,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
