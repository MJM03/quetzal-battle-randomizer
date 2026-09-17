/* V34 — GIF real de Pokémon Showdown */
(function(){
  const GIF_BASE='https://play.pokemonshowdown.com/sprites/ani/';
  const HOME_BASE='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
  function slug(raw){return String(raw||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-')}
  function apply(){
    document.querySelectorAll('#teamSpriteLayer .team-sprite-wrap img.team-sprite').forEach(img=>{
      const wrap=img.closest('.team-sprite-wrap');
      const name=slug(wrap?.dataset?.pokemonName);
      const id=Number(wrap?.dataset?.pokemonId||0);
      if(!name)return;
      const gif=GIF_BASE+name+'.gif';
      if(img.dataset.qbrGif===gif && img.src===gif)return;
      img.dataset.qbrGif=gif;
      img.onerror=null;
      img.src=gif;
      img.onerror=function(){
        img.onerror=null;
        if(id)img.src=HOME_BASE+id+'.png';
      };
    });
  }
  function boot(){
    const layer=document.getElementById('teamSpriteLayer');if(!layer)return;
    new MutationObserver(()=>requestAnimationFrame(apply)).observe(layer,{childList:true,subtree:true});
    setInterval(apply,400);
    apply();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
