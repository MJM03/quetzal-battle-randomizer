/* V35 — GIF animado en ruleta, tarjetas de equipos y enfrentamientos */
(function(){
  const GIF_BASE='https://play.pokemonshowdown.com/sprites/ani/';
  const HOME_BASE='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
  function slug(raw){return String(raw||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-')}
  function getName(img){const wrap=img.closest('.team-sprite-wrap');return slug(wrap?.dataset?.pokemonName||img.dataset?.pokemonName||img.alt||'')}
  function getId(img){const wrap=img.closest('.team-sprite-wrap');return Number(wrap?.dataset?.pokemonId||img.dataset?.pokemonId||0)}
  function applyTo(img){
    if(!(img instanceof HTMLImageElement))return;
    if(!img.matches('#teamSpriteLayer .team-sprite,.pokemon-card img,.featured-pokemon,.fighter-pokemon,.battle-arena .pokemon-sprite'))return;
    const name=getName(img),id=getId(img);if(!name)return;
    const gif=GIF_BASE+name+'.gif';
    if(img.dataset.qbrGif===gif){if(img.src===gif||img.dataset.qbrGifFailed==='1')return;}
    img.dataset.qbrGif=gif;img.dataset.qbrGifFailed='0';img.onerror=null;img.src=gif;
    img.onerror=function(){img.onerror=null;img.dataset.qbrGifFailed='1';if(id)img.src=HOME_BASE+id+'.png'};
  }
  function apply(root=document){root.querySelectorAll?.('#teamSpriteLayer .team-sprite,.pokemon-card img,.featured-pokemon,.fighter-pokemon,.battle-arena .pokemon-sprite').forEach(applyTo)}
  function boot(){
    apply();
    const obs=new MutationObserver(muts=>muts.forEach(m=>{
      if(m.type==='childList')m.addedNodes.forEach(n=>{if(n.nodeType===1){if(n.matches?.('img'))applyTo(n);apply(n)}});
      if(m.type==='attributes'&&m.target instanceof HTMLImageElement)applyTo(m.target);
    }));
    obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','alt','data-pokemon-id','data-pokemon-name']});
    setInterval(apply,300);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
