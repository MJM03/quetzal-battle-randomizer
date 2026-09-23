/* V46 — estabilidad + modo Monotipo balanceado */
(function(){
  const TYPES=['Normal','Lucha','Volador','Veneno','Tierra','Roca','Bicho','Fantasma','Acero','Fuego','Agua','Planta','Eléctrico','Psíquico','Hielo','Dragón','Siniestro','Hada'];
  const STATS='https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_stats.csv';
  const TYPECSV='https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_types.csv';
  const KEY='qbr-monotype-meta-v1',ASSIGN='qbr-monotype-assign-v1';
  let meta={},ready=false,busy=false,original=null,watchdog=null,loadingPromise=null;
  function csv(t){const r=t.trim().split(/\r?\n/),h=r.shift().split(',');return r.map(x=>{const c=x.split(','),o={};h.forEach((k,i)=>o[k]=c[i]);return o})}
  function build(s,t){const m={};csv(s).forEach(r=>{const id=+r.pokemon_id;if(!id||id>1025)return;(m[id]??={stats:[0,0,0,0,0,0],types:[]}).stats[+r.stat_id-1]=+r.base_stat||0});csv(t).forEach(r=>{const id=+r.pokemon_id;if(!id||id>1025)return;const x=m[id]??={stats:[0,0,0,0,0,0],types:[]};x.types.push(+r.type_id)});Object.values(m).forEach(x=>x.bst=x.stats.reduce((a,b)=>a+b,0));return m}
  async function load(){if(loadingPromise)return loadingPromise;loadingPromise=(async()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&Object.keys(x).length>900){meta=x;ready=true;return}}catch{}try{const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),6500);const [a,b]=await Promise.all([fetch(STATS,{signal:ctl.signal}),fetch(TYPECSV,{signal:ctl.signal})]);clearTimeout(timer);meta=build(await a.text(),await b.text());ready=true;try{localStorage.setItem(KEY,JSON.stringify(meta))}catch{}}catch(e){console.warn('[QBR mono] metadata fallback',e)}finally{loadingPromise=null}})();return loadingPromise}
  function cfgNow(){return typeof cfg==='function'?cfg():{}}
  function used(except){const s=new Set();if(!cfgNow().unique)return s;try{currentTeams.forEach((t,i)=>{if(i!==except)(t||[]).forEach(p=>p&&s.add(+p.id))})}catch{}return s}
  function pool(){try{return poolFor(cfgNow())}catch{return []}}
  function assignments(){
    const c=cfgNow(),count=c.players||4;let a=[];try{a=JSON.parse(localStorage.getItem(ASSIGN)||'[]')}catch{}
    if(a.length!==count){const viable=TYPES.map((_,i)=>i+1).filter(type=>pool().filter(p=>meta[p.id]?.types.includes(type)).length>=c.teamSize);a=[];while(a.length<count&&viable.length){const i=Math.floor(Math.random()*viable.length);a.push(viable.splice(i,1)[0])}localStorage.setItem(ASSIGN,JSON.stringify(a))}
    return a;
  }
  function monoTeam(pi){
    if(!ready||!original)return null;
    const c=cfgNow(),type=assignments()[pi],u=used(pi);
    let candidates=pool().filter(p=>meta[p.id]?.types.includes(type)&&(!c.unique||!u.has(+p.id)));
    if(candidates.length<c.teamSize)return null;
    const target=500,team=[];
    for(let i=0;i<c.teamSize;i++){
      const remaining=candidates.filter(p=>!team.some(x=>x.id===p.id));
      remaining.sort((a,b)=>Math.abs(meta[a.id].bst-target)-Math.abs(meta[b.id].bst-target)+(Math.random()-.5)*25);
      const band=remaining.slice(0,Math.min(24,remaining.length));
      const p=band[Math.floor(Math.random()*band.length)];if(!p)break;team.push(p);
    }
    return team.length===c.teamSize?team:null;
  }
  function install(){
    const mode=document.getElementById('mode');if(!mode)return;
    if(!mode.querySelector('option[value="monotype"]')){const o=document.createElement('option');o.value='monotype';o.textContent='Monotipo balanceado';mode.appendChild(o)}
    mode.addEventListener('change',()=>{localStorage.removeItem(ASSIGN)});
    if(typeof window.makeTeamForPlayer==='function'){original=window.makeTeamForPlayer;window.makeTeamForPlayer=function(pi){if(cfgNow().mode!=='monotype')return original(pi);const t=monoTeam(pi);if(t)return t;throw new Error('MONOTYPE_NOT_READY')}}
  }
  function unlock(){
    busy=false;clearTimeout(watchdog);
    try{teamRolling=false;spinning=false;teamSpinBtn.disabled=false;document.getElementById('versusBtn').disabled=false;document.querySelector('.forge-panel')?.classList.remove('rolling')}catch{}
  }
  function harden(){
    const btn=document.getElementById('teamSpinBtn');if(!btn)return;
    btn.addEventListener('click',()=>{if(busy)return;busy=true;clearTimeout(watchdog);watchdog=setTimeout(()=>{console.warn('[QBR] watchdog desbloqueó la ruleta');unlock()},7000)},true);
    const observer=new MutationObserver(()=>{if(!btn.disabled)busy=false});observer.observe(btn,{attributes:true,attributeFilter:['disabled']});
    window.addEventListener('error',unlock);window.addEventListener('unhandledrejection',unlock);
  }
  function badges(){
    if(cfgNow().mode!=='monotype')return;
    const a=assignments();document.querySelectorAll('#teams .team-card').forEach((card,i)=>{if(card.querySelector('.mono-badge'))return;const h=card.querySelector('.team-head');if(h&&a[i]){const b=document.createElement('span');b.className='mono-badge';b.textContent='◆ '+TYPES[a[i]-1];h.appendChild(b)}})
  }
  function boot(){install();harden();load().then(()=>{if(cfgNow().mode==='monotype')localStorage.removeItem(ASSIGN)});const teams=document.getElementById('teams');if(teams)new MutationObserver(()=>requestAnimationFrame(badges)).observe(teams,{childList:true,subtree:true});setInterval(badges,1000)}
  function rerollSlot(ti,pi){
    if(!ready)return;
    const c=cfgNow(),type=assignments()[ti],u=used(ti),team=currentTeams[ti]||[];
    team.forEach((p,i)=>{if(i!==pi&&p)u.add(+p.id)});
    const old=team[pi]?.id;
    let candidates=pool().filter(p=>p.id!==old&&meta[p.id]?.types.includes(type)&&(!c.unique||!u.has(+p.id)));
    if(!candidates.length)return;
    candidates.sort((a,b)=>Math.abs(meta[a.id].bst-500)-Math.abs(meta[b.id].bst-500)+(Math.random()-.5)*30);
    const band=candidates.slice(0,Math.min(24,candidates.length)),p=band[Math.floor(Math.random()*band.length)];
    currentTeams[ti][pi]=p;localStorage.setItem('qbr-teams-v7',JSON.stringify(currentTeams));renderTeams();renderVersus();
  }
  document.getElementById('teams')?.addEventListener('click',e=>{
    if(cfgNow().mode!=='monotype')return;
    const btn=e.target.closest('.reroll-one');if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    const cards=[...document.querySelectorAll('#teams .team-card')],card=btn.closest('.team-card'),ti=cards.indexOf(card),pi=[...card.querySelectorAll('.reroll-one')].indexOf(btn);
    if(ti>=0&&pi>=0)rerollSlot(ti,pi);
  },true);
  window.QBRMonotype={ready:()=>ready,load,validate:(team,pi)=>{const t=assignments()[pi];return !!t&&(team||[]).every(p=>meta[p.id]?.types.includes(t))},typeFor:pi=>TYPES[(assignments()[pi]||1)-1],rerollSlot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();