/* V13 — reliable Pokemon image loading on iOS/Safari */
(function(){
  function normalizeShowdownName(name=''){
    return String(name).toLowerCase().trim().replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-');
  }
  function extractId(img){
    const fromData=Number(img.dataset.pokemonId||0);if(fromData)return fromData;
    const src=img.currentSrc||img.src||'';
    const m=src.match(/(?:home|official-artwork|pokemon)\/(\d+)\.(?:png|gif|webp)/i)||src.match(/\/(\d+)\.png(?:\?|$)/i);
    return m?Number(m[1]):0;
  }
  function sourceList(img){
    const id=extractId(img);
    const name=normalizeShowdownName(img.alt||img.dataset.pokemonName||'');
    const sources=[];
    if(name) sources.push(`https://play.pokemonshowdown.com/sprites/gen5/${name}.png`);
    if(id){
      sources.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`);
      sources.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
      sources.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`);
    }
    return [...new Set(sources.filter(Boolean))];
  }
  function arm(img){
    if(!(img instanceof HTMLImageElement))return;
    if(!img.matches('.pokemon-card img,.team-sprite,.v10-pokemon,.fighter-pokemon,.featured-pokemon img'))return;
    img.loading='eager';
    img.decoding='async';
    const id=extractId(img); if(id) img.dataset.pokemonId=String(id);
    img.dataset.pokemonName=img.alt||img.dataset.pokemonName||'';
    if(img.dataset.qbrImageArmed==='1')return;
    img.dataset.qbrImageArmed='1';
    img.addEventListener('error',()=>{
      const sources=sourceList(img);
      let idx=Number(img.dataset.qbrFallbackIndex||0);
      const current=(img.currentSrc||img.src||'').split('?')[0];
      while(idx<sources.length && sources[idx].split('?')[0]===current)idx++;
      if(idx<sources.length){
        img.dataset.qbrFallbackIndex=String(idx+1);
        img.src=sources[idx];
      } else {
        img.classList.add('qbr-image-failed');
      }
    });
    if(img.complete && img.naturalWidth===0){
      const sources=sourceList(img);
      if(sources.length){img.dataset.qbrFallbackIndex='1';img.src=sources[0];}
    }
  }
  function scan(root=document){root.querySelectorAll?.('.pokemon-card img,.team-sprite,.v10-pokemon,.fighter-pokemon,.featured-pokemon img').forEach(arm)}
  scan();
  const obs=new MutationObserver(muts=>muts.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches?.('img'))arm(n);scan(n)})));
  obs.observe(document.documentElement,{childList:true,subtree:true});

  /* Replace team-card sprite URLs with a lighter independent host first. */
  const oldRenderTeams=window.renderTeams;
  if(typeof oldRenderTeams==='function'){
    window.renderTeams=function(reveal=false){
      oldRenderTeams(reveal);
      document.querySelectorAll('.pokemon-card img').forEach(img=>{
        const id=extractId(img); const name=normalizeShowdownName(img.alt);
        if(id)img.dataset.pokemonId=String(id);
        if(name){img.dataset.qbrFallbackIndex='1';img.src=`https://play.pokemonshowdown.com/sprites/gen5/${name}.png`;}
        arm(img);
      });
    };
  }

  /* Repaint already-rendered teams immediately. */
  if(typeof currentTeams!=='undefined' && currentTeams?.length && typeof renderTeams==='function')renderTeams(false);
})();