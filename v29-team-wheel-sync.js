/* V29 — ruleta sincronizada con el equipo real */
(function(){
  let lastSignature='';
  function size(){const el=document.querySelector('#teamSize');return el?+el.value:6}
  function readTeams(){try{return JSON.parse(localStorage.getItem('qbr-teams-v7')||'[]')}catch{return []}}
  function currentTeam(){const teams=readTeams();const draft=+(localStorage.getItem('qbr-draft-index-v7')||0);return teams[Math.max(0,draft-1)]||teams[teams.length-1]||[]}
  function trimVisible(){const layer=document.querySelector('#teamSpriteLayer');if(!layer)return;[...layer.querySelectorAll('.team-sprite-wrap')].forEach((n,i)=>n.hidden=i>=size())}
  function sync(){const team=currentTeam();const ids=team.map(p=>p?.id).filter(Number.isInteger).slice(0,size());const sig=JSON.stringify({s:size(),t:ids});if(sig===lastSignature){trimVisible();return}lastSignature=sig;if(ids.length&&typeof window.renderTeamWheelPreview==='function')window.renderTeamWheelPreview(ids,true);trimVisible()}
  function install(){sync();trimVisible();setInterval(sync,180);document.querySelector('#teamSize')?.addEventListener('change',()=>{lastSignature='';sync()})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();