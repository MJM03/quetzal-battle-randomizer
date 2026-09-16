/* V30 — fuente única para la ruleta: equipo realmente guardado */
(function(){
  const layer=document.querySelector('#teamSpriteLayer');
  const sizeEl=document.querySelector('#teamSize');
  if(!layer)return;
  const TEAMS_KEY='qbr-teams-v7',DRAFT_KEY='qbr-draft-index-v7';
  let lastSig='';

  function size(){return Number(sizeEl?.value||6)===3?3:6}
  function readTeams(){try{return JSON.parse(localStorage.getItem(TEAMS_KEY)||'[]')}catch{return []}}
  function readTeam(){
    const teams=readTeams();
    const d=Number(localStorage.getItem(DRAFT_KEY)||0);
    // Durante el sorteo, draft apunta al jugador actual; después de guardar, apunta al siguiente.
    const idx=d>0?d-1:0;
    return Array.isArray(teams[idx])?teams[idx]:[];
  }
  function hideExtra(){
    const n=size();
    [...layer.querySelectorAll('.team-sprite-wrap')].forEach((el,i)=>{el.hidden=i>=n});
  }
  function paint(team){
    const ids=(team||[]).map(p=>p?.id).filter(Number.isInteger).slice(0,size());
    if(!ids.length){hideExtra();return}
    // Usamos el renderizador oficial actual para conservar sprites, dex y badges.
    const renderer=window.renderTeamWheelPreview;
    if(typeof renderer==='function'){
      try{renderer(ids,true)}catch(e){console.warn('QBR V30 render',e)}
    }
    hideExtra();
  }
  function sync(force=false){
    const team=readTeam();
    const sig=JSON.stringify({size:size(),ids:team.map(p=>p?.id).filter(Number.isInteger)});
    if(!force&&sig===lastSig){hideExtra();return}
    lastSig=sig;
    paint(team);
  }

  // Corrige el problema real: app-v8 genera 8 previews internamente; V30 recorta el DOM a 3/6.
  const observer=new MutationObserver(()=>hideExtra());
  observer.observe(layer,{childList:true,subtree:true});

  sizeEl?.addEventListener('change',()=>{lastSig='';setTimeout(()=>sync(true),0)});
  setInterval(()=>sync(false),120);
  sync(true);

  window.QBRWheelSync={refresh:()=>{lastSig='';sync(true)}};
})();
