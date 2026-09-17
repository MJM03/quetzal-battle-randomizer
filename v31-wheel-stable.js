/* V31 — ruleta estable: elimina superposición y mantiene 3/6 según configuración */
(function(){
  function boot(){
    const layer=document.getElementById('teamSpriteLayer'), sizeEl=document.getElementById('teamSize');
    if(!layer||!sizeEl)return;
    const TEAMS_KEY='qbr-teams-v7',DRAFT_KEY='qbr-draft-index-v7';
    let lastKey='';
    const count=()=>Number(sizeEl.value)===3?3:6;
    const trim=()=>{const n=count();[...layer.querySelectorAll('.team-sprite-wrap')].forEach((el,i)=>{if(i>=n)el.remove()})};
    function readTeam(){
      try{
        const all=JSON.parse(localStorage.getItem(TEAMS_KEY)||'[]'),d=Number(localStorage.getItem(DRAFT_KEY)||0);
        if(d>0&&Array.isArray(all[d-1]))return all[d-1];
        for(let i=all.length-1;i>=0;i--)if(Array.isArray(all[i])&&all[i].length)return all[i];
      }catch{}
      return [];
    }
    function syncSaved(force=false){
      const team=readTeam().slice(0,count()).filter(p=>p&&Number.isInteger(p.id));
      const key=JSON.stringify([count(),team.map(p=>p.id)]);
      if(!force&&key===lastKey)return;
      lastKey=key;
      if(team.length&&typeof window.renderTeamWheelPreview==='function'){
        try{window.renderTeamWheelPreview(team.map(p=>p.id),true)}catch{}
      }
      [...layer.querySelectorAll('.team-sprite-wrap')].forEach((el,i)=>{
        const p=team[i];
        if(p){el.dataset.pokemonId=String(p.id);el.dataset.pokemonName=String(p.name||p.displayName||'');}
        if(i>=count())el.remove();
      });
      trim();
    }
    function refresh(){lastKey='';syncSaved(true)}
    const observer=new MutationObserver(()=>{
      trim();
      [...layer.querySelectorAll('.team-sprite-wrap')].forEach((el,i)=>{
        if(!el.dataset.pokemonId){const p=readTeam()[i];if(p){el.dataset.pokemonId=String(p.id);el.dataset.pokemonName=String(p.name||p.displayName||'')}}
      });
    });
    observer.observe(layer,{childList:true,subtree:true});
    sizeEl.addEventListener('change',refresh);
    setInterval(()=>{
      trim();
      const rolling=document.querySelector('.forge-panel')?.classList.contains('rolling');
      if(!rolling)syncSaved(false);
    },120);
    syncSaved(true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
