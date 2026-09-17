/* V42 — GIFs globales excepto EQUIPOS SORTEADOS (los maneja v42) */
(function(){
  const BASE='https://play.pokemonshowdown.com/sprites/ani/';
  const HOME='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
  const SELECTOR='#teamSpriteLayer img.team-sprite,.featured-pokemon,.battle-arena img,.fighter-pokemon';
  function slug(raw){
    let s=String(raw||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    s=s.replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-');
    s=s.replace(/^mega-(.+)-(x|y)$/,'$1-mega-$2').replace(/^mega-(.+)$/,'$1-mega').replace(/^primal-(.+)$/,'$1-primal');
    return s;
  }
  function idOf(img){return Number(img.dataset.pokemonId||img.closest('[data-pokemon-id]')?.dataset?.pokemonId||0)}
  function nameOf(img){const wrap=img.closest('.team-sprite-wrap');return wrap?.dataset?.pokemonName||img.dataset.pokemonName||img.alt||img.closest('[data-pokemon-name]')?.dataset?.pokemonName||''}
  function arm(img){
    if(!(img instanceof HTMLImageElement)||!img.matches(SELECTOR))return;
    const name=slug(nameOf(img));if(!name)return;
    const id=idOf(img),gif=BASE+name+'.gif';
    if(img.dataset.qbrGif===gif&&(img.currentSrc||img.src).split('?')[0]===gif)return;
    img.dataset.qbrGif=gif;img.dataset.qbrGifFallback=String(id||0);img.onerror=null;img.src=gif;
    img.onerror=function(){img.onerror=null;const n=Number(img.dataset.qbrGifFallback||0);if(n)img.src=HOME+n+'.png'};
  }
  function scan(root=document){root.querySelectorAll?.(SELECTOR).forEach(arm);if(root instanceof HTMLImageElement)arm(root)}
  function boot(){scan();const obs=new MutationObserver(muts=>{for(const m of muts){if(m.type==='childList')m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)});if(m.type==='attributes'&&m.target instanceof HTMLImageElement&&m.attributeName==='src'){const img=m.target;if(img.dataset.qbrGif&&(img.currentSrc||img.src).split('?')[0]!==img.dataset.qbrGif)arm(img)}}});obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});setInterval(scan,300)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
