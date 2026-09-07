/* V14 — resilient Pokemon + trainer image loading */
(function(){
  const JSDELIVR_BASE='https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon';
  const RAW_BASE='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  const TRAINER_BASE='https://play.pokemonshowdown.com/sprites/trainers';
  const SAFE_TRAINERS=['red','brendan','may','dawn','cynthia'];

  function idFrom(img){
    const d=Number(img.dataset.pokemonId||0); if(d)return d;
    const s=img.currentSrc||img.src||'';
    const m=s.match(/\/(\d+)\.(?:png|gif|webp)(?:\?|$)/i); return m?Number(m[1]):0;
  }
  function pokemonSources(id,name=''){
    const clean=String(name||'').toLowerCase().replace(/[^a-z0-9-]/g,'');
    const out=[];
    if(id){
      out.push(`${JSDELIVR_BASE}/other/official-artwork/${id}.png`);
      out.push(`${JSDELIVR_BASE}/other/home/${id}.png`);
      out.push(`${JSDELIVR_BASE}/${id}.png`);
      out.push(`${RAW_BASE}/other/official-artwork/${id}.png`);
      out.push(`${RAW_BASE}/other/home/${id}.png`);
      out.push(`${RAW_BASE}/${id}.png`);
    }
    if(clean)out.push(`https://play.pokemonshowdown.com/sprites/gen5/${clean}.png`);
    return [...new Set(out)];
  }
  function nextSource(img,sources){
    let i=Number(img.dataset.qbr14idx||0);
    if(i>=sources.length){
      img.removeAttribute('src');
      img.classList.add('qbr14-missing');
      return;
    }
    img.dataset.qbr14idx=String(i+1);
    img.src=sources[i];
  }
  function armPokemon(img){
    if(!(img instanceof HTMLImageElement))return;
    if(!img.matches('.pokemon-card img,.team-sprite,.v10-pokemon,.fighter-pokemon,.featured-pokemon img'))return;
    const id=idFrom(img); if(id)img.dataset.pokemonId=String(id);
    const sources=pokemonSources(id,img.alt||img.dataset.pokemonName||'');
    img.loading='eager'; img.decoding='async';
    img.onerror=()=>nextSource(img,sources);
    if(!img.dataset.qbr14armed){
      img.dataset.qbr14armed='1'; img.dataset.qbr14idx='0'; nextSource(img,sources);
    }
  }

  function trainerSources(seed='trainer'){
    let h=0,s=String(seed);for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;
    const first=SAFE_TRAINERS[Math.abs(h)%SAFE_TRAINERS.length];
    return [first,...SAFE_TRAINERS.filter(x=>x!==first)].map(n=>`${TRAINER_BASE}/${n}.png`);
  }
  function armTrainer(img){
    if(!(img instanceof HTMLImageElement))return;
    if(!img.matches('.trainer-avatar,.fighter-trainer,.v10-trainer,.v11-trainer'))return;
    const sources=trainerSources(img.alt||img.dataset.seed||'trainer');
    img.loading='eager'; img.decoding='async';
    img.onerror=()=>{
      let i=Number(img.dataset.qbr14trainerIdx||0);
      if(i>=sources.length){img.removeAttribute('src');img.classList.add('qbr14-trainer-missing');return}
      img.dataset.qbr14trainerIdx=String(i+1); img.src=sources[i];
    };
    if(!img.dataset.qbr14trainerArmed){img.dataset.qbr14trainerArmed='1';img.dataset.qbr14trainerIdx='1';img.src=sources[0]}
  }
  function scan(root=document){
    root.querySelectorAll?.('.pokemon-card img,.team-sprite,.v10-pokemon,.fighter-pokemon,.featured-pokemon img').forEach(armPokemon);
    root.querySelectorAll?.('.trainer-avatar,.fighter-trainer,.v10-trainer,.v11-trainer').forEach(armTrainer);
  }
  scan();
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches?.('img')){armPokemon(n);armTrainer(n)}scan(n)}))).observe(document.documentElement,{childList:true,subtree:true});

  const rerender=window.renderTeams;
  if(typeof rerender==='function')window.renderTeams=function(reveal=false){rerender(reveal);scan(document)};
  const rerenderVs=window.renderVersus;
  if(typeof rerenderVs==='function')window.renderVersus=function(reveal=false){rerenderVs(reveal);scan(document)};
  if(typeof currentTeams!=='undefined'&&currentTeams?.length&&typeof renderTeams==='function')renderTeams(false);
  if(typeof currentMatchup!=='undefined'&&currentMatchup&&typeof renderVersus==='function')renderVersus(false);
})();