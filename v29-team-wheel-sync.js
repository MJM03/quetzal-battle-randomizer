/* V29 — ruleta refleja exactamente el equipo generado */
(function(){
  const original=window.renderTeamWheelPreview;
  if(typeof original!=='function')return;

  function teamSize(){
    const el=document.querySelector('#teamSize');
    return el?+el.value:6;
  }

  window.renderTeamWheelPreview=function(ids,showDex=false){
    let list=Array.isArray(ids)?ids.filter(Number.isInteger):[];
    // En una configuración de 3/6, la ruleta nunca muestra más Pokémon que el equipo.
    list=list.slice(0,teamSize());
    if(!list.length && Array.isArray(window.currentTeams)){
      const idx=+(localStorage.getItem('qbr-draft-index-v7')||0);
      const team=window.currentTeams[Math.max(0,idx-1)]||[];
      list=team.map(p=>p?.id).filter(Number.isInteger).slice(0,teamSize());
    }
    original(list,showDex);
  };

  // Tras un reroll automático/manual, vuelve a pintar la ruleta con el mismo equipo.
  window.QBRRefreshTeamWheel=function(){
    try{
      const teams=JSON.parse(localStorage.getItem('qbr-teams-v7')||'[]');
      const idx=+(localStorage.getItem('qbr-draft-index-v7')||0);
      const team=teams[Math.max(0,idx-1)]||teams[teams.length-1]||[];
      const ids=team.map(p=>p?.id).filter(Number.isInteger).slice(0,teamSize());
      if(ids.length)window.renderTeamWheelPreview(ids,true);
    }catch(e){console.warn('QBR V29 wheel sync',e)}
  };
})();