/* V33 — Pokémon animados en la ruleta: usa el nombre de especie de Showdown, no el número de Pokédex */
(function(){
  const GIF_BASE='https://play.pokemonshowdown.com/sprites/ani/';
  const HOME_BASE='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
  function slug(p){
    const raw=String(p?.name||p?.species||p?.displayName||'').toLowerCase().trim();
    return raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/♀/g,'-f').replace(/♂/g,'-m').replace(/[.'’]/g,'').replace(/\s+/g,'-');
  }
  function apply(){
    document.querySelectorAll('#teamSpriteLayer .team-sprite-wrap img.team-sprite').forEach(img=>{
      const wrap=img.closest('.team-sprite-wrap');
      const id=Number(wrap?.dataset?.pokemonId||img.dataset?.pokemonId||0);
      let name=wrap?.dataset?.pokemonName||'';
      if(!name && id && Array.isArray(window.currentTeams)){
        for(const team of window.currentTeams){const p=team?.find?.(x=>Number(x?.id)===id);if(p){name=p.name||p.displayName||'';break;}}
      }
      const key=slug({name});
      if(!key)return;
      const src=GIF_BASE+key+'.gif';
      if(img.dataset.qbrGif===src)return;
      img.dataset.qbrGif=src;
      img.onerror=function(){
        img.onerror=null;
        if(id)img.src=HOME_BASE+id+'.png';
      };
      img.src=src;
    });
  }
  function boot(){
    const layer=document.getElementById('teamSpriteLayer');if(!layer)return;
    new MutationObserver(()=>requestAnimationFrame(apply)).observe(layer,{childList:true,subtree:true});
    setInterval(apply,500);apply();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
