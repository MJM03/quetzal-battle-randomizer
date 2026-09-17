/* V32 — Pokémon animados en la ruleta */
(function(){
  const GIF_BASE='https://play.pokemonshowdown.com/sprites/ani/';
  function apply(){
    document.querySelectorAll('#teamSpriteLayer .team-sprite-wrap img.team-sprite').forEach(img=>{
      const id=img.closest('.team-sprite-wrap')?.querySelector('.dex-badge')?.textContent?.replace(/\D/g,'');
      if(!id)return;
      const src=GIF_BASE+Number(id)+'.gif';
      if(img.dataset.qbrGif===src)return;
      img.dataset.qbrGif=src;
      img.src=src;
      img.onerror=function(){
        const fallback='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/'+Number(id)+'.png';
        if(img.src!==fallback)img.src=fallback;
      };
    });
  }
  function boot(){
    const layer=document.getElementById('teamSpriteLayer');if(!layer)return;
    new MutationObserver(apply).observe(layer,{childList:true,subtree:true});
    setInterval(apply,300);apply();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
