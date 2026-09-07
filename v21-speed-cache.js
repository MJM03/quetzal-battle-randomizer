/* V21 — faster roulette previews + sprite/API prewarming */
(function(){
  const NORMAL_BASE='https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/home/';
  const API='https://pokeapi.co/api/v2/pokemon/';
  const WARM_COUNT=18;
  const fallback=[6,25,94,130,149,196,212,248,257,282,373,376,445,448,700,778,887,937];
  let warmPool=[];

  function uniq(arr){return [...new Set(arr.filter(Boolean).map(Number).filter(n=>n>0))]}
  function buildWarmPool(){
    const fromTeams=[];
    try{(currentTeams||[]).forEach(t=>(t||[]).forEach(p=>p?.id&&fromTeams.push(p.id)))}catch{}
    const source=(typeof pokemon!=='undefined'&&pokemon?.length)?pokemon.map(p=>p.id):[];
    const random=[];
    while(random.length<WARM_COUNT&&source.length){const id=source[Math.floor(Math.random()*source.length)];if(!random.includes(id))random.push(id)}
    warmPool=uniq([...fromTeams,...random,...fallback]).slice(0,WARM_COUNT);
    if(warmPool.length<6)warmPool=fallback.slice(0,WARM_COUNT);
    return warmPool;
  }
  function sample6(){
    if(warmPool.length<6)buildWarmPool();
    const a=[...warmPool];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
    return a.slice(0,6);
  }
  function preloadUrl(url){
    return new Promise(resolve=>{const img=new Image();img.decoding='async';img.fetchPriority='low';img.onload=img.onerror=()=>resolve();img.src=url});
  }
  function megaApiName(p){
    if(!p?.mega)return null;
    const d=String(p.displayName||'').toLowerCase();
    const base=(typeof pokemon!=='undefined'&&pokemon.find(x=>x.id===p.id)?.name)||p.name||'';
    if(d.includes('charizard x'))return 'charizard-mega-x';
    if(d.includes('charizard y'))return 'charizard-mega-y';
    if(d.includes('mewtwo x'))return 'mewtwo-mega-x';
    if(d.includes('mewtwo y'))return 'mewtwo-mega-y';
    if(d.includes('rayquaza'))return 'rayquaza-mega';
    return `${String(base).toLowerCase()}-mega`;
  }
  async function prewarm(){
    buildWarmPool();
    const urls=warmPool.map(id=>`${NORMAL_BASE}${id}.png`);
    try{(currentTeams||[]).forEach(t=>(t||[]).forEach(p=>{if(p?.mega){const n=megaApiName(p);if(n)fetch(`${API}${n}`,{cache:'force-cache'}).catch(()=>{})}else if(p?.id)urls.push(`${NORMAL_BASE}${p.id}.png`)}))}catch{}
    const queue=uniq([]); // keeps function intentionally side-effect free for Safari
    for(let i=0;i<urls.length;i+=4) await Promise.all(urls.slice(i,i+4).map(preloadUrl));
  }

  // During the 3s animation, reuse a small already-warmed image pool instead of requesting dozens of new sprites.
  const originalWheel=window.renderTeamWheelPreview;
  if(typeof originalWheel==='function'){
    window.renderTeamWheelPreview=function(ids,showDex=false){
      return originalWheel(showDex?ids:sample6(),showDex);
    };
    try{renderTeamWheelPreview=window.renderTeamWheelPreview}catch{}
  }

  // Make final team/battle sprites load with priority once they enter the DOM.
  function tune(root=document){
    root.querySelectorAll?.('.pokemon-card img,.team-sprite,.fighter-pokemon,.v10-pokemon,.trainer-avatar,.fighter-trainer,.v10-trainer').forEach(img=>{
      img.decoding='async';
      if(img.closest('.pokemon-card')||img.closest('.versus-result')) img.fetchPriority='high';
    });
  }
  tune();
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)tune(n)}))).observe(document.body,{subtree:true,childList:true});

  // Rewarm after each completed team so later views and VS cards are instant.
  const teamObserver=new MutationObserver(()=>{
    clearTimeout(teamObserver._t);
    teamObserver._t=setTimeout(()=>{buildWarmPool();try{(currentTeams||[]).flat().filter(Boolean).forEach(p=>{if(!p.mega)preloadUrl(`${NORMAL_BASE}${p.id}.png`)})}catch{}},180);
  });
  const teamsNode=document.getElementById('teams');if(teamsNode)teamObserver.observe(teamsNode,{childList:true,subtree:true});

  const start=()=>{if('requestIdleCallback'in window)requestIdleCallback(()=>prewarm(),{timeout:1500});else setTimeout(prewarm,250)};
  if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
