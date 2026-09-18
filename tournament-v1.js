/* V2 — Modo Torneo con ruleta */
(function(){
  const KEY='qbr-tournament-v3';
  const panel=document.getElementById('tournamentPanel'); if(!panel)return;
  const bracketEl=document.getElementById('tournamentBracket'),statusEl=document.getElementById('tournamentStatus');
  const startBtn=document.getElementById('tournamentStart'),resetBtn=document.getElementById('tournamentReset');
  let state=load(), spinning=false, rotation=0;
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function names(){let n=[];try{n=JSON.parse(localStorage.getItem('qbr-player-names-v1')||'[]')}catch{}const count=Number(document.getElementById('players')?.value||4);return Array.from({length:count},(_,i)=>(n[i]||'').trim()||'Jugador '+(i+1))}
  function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function makeMatch(a,b){return {a,b,winner:null}}
  function start(){if(spinning)return;const p=names();state={players:p,round:'draw',matches:[],final:null,champion:null};save();render();spinTournament()}
  function spinTournament(){
    if(spinning||!state)return; spinning=true; startBtn.disabled=true;
    statusEl.textContent='🎰 La ruleta está sorteando los enfrentamientos…';
    const pool=shuffle(state.players),count=pool.length;
    const slots=count===4?4:count===3?3:2;
    const wheel=document.getElementById('tournamentWheel');
    if(wheel){rotation+=1440+Math.floor(Math.random()*720);wheel.style.transform='rotateZ('+rotation+'deg)'}
    setTimeout(()=>{
      if(count===2)state.final=makeMatch(pool[0],pool[1]);
      else if(count===3){state.matches=[makeMatch(pool[0],pool[1])];state.final=makeMatch(null,pool[2])}
      else state.matches=[makeMatch(pool[0],pool[1]),makeMatch(pool[2],pool[3])];
      state.round=count===2?'final':'semis';save();spinning=false;startBtn.disabled=false;render();
    },2400);
  }
  function pickWinner(round,index,winner){
    if(!state)return;
    if(round==='semis'){
      const m=state.matches[index];if(!m||m.winner)return;m.winner=winner;
      if(state.matches.length===2&&state.matches.every(x=>x.winner)){state.final=makeMatch(state.matches[0].winner,state.matches[1].winner);state.round='final'}
      else if(state.matches.length===1&&state.final){state.final.a=m.winner;state.round='final'}
    }else if(round==='final'&&state.final&&!state.final.winner){state.final.winner=winner;state.champion=winner;state.round='champion'}
    save();render();
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function playerHtml(name,active,winner,loser,round,index){
    if(!name)return '<div class="tournament-player waiting">Esperando…</div>';
    const button=active&&!winner&&!loser?'<button type="button" data-round="'+round+'" data-index="'+index+'" data-winner="'+escapeHtml(name)+'">Gana</button>':'';
    return '<div class="tournament-player '+(active?'active ':'')+(winner?'winner ':'')+(loser?'loser':'')+'"><span>'+escapeHtml(name)+'</span>'+button+'</div>';
  }
  function matchHtml(m,round,index){if(!m)return '';const active=!m.winner&&m.a&&m.b,loser=m.winner?(m.winner===m.a?m.b:m.a):null;return '<div class="tournament-match '+(active?'current ':'')+(m.winner?'done':'')+'">'+playerHtml(m.a,active,m.winner===m.a,loser===m.a,round,index)+playerHtml(m.b,active,m.winner===m.b,loser===m.b,round,index)+'</div>'}
  function render(){
    if(!state){bracketEl.innerHTML='<div class="tournament-empty">Pulsa <strong>🎰 Sortear torneo</strong> para crear el cuadro.</div>';statusEl.textContent='Sin torneo activo';return}
    const semis=state.matches.map((m,i)=>matchHtml(m,'semis',i)).join('');
    const wheel=state.round==='draw'?'<div class="tournament-draw"><div class="tournament-wheel-pointer"></div><div id="tournamentWheel" class="tournament-wheel"><div class="tournament-wheel-center">🎰<small>TORNEO</small></div></div></div>':'';
    if(state.champion){bracketEl.innerHTML='<div class="tournament-round"><h3>SEMIFINALES</h3>'+semis+'</div><div class="tournament-round"><h3>FINAL</h3>'+matchHtml(state.final,'final',0)+'</div><div class="tournament-champion"><div><small>CAMPEÓN DEL TORNEO</small><strong>🏆 '+escapeHtml(state.champion)+'</strong></div></div>';statusEl.textContent='Torneo terminado · campeón: '+state.champion}
    else if(state.round==='draw'){bracketEl.innerHTML='<div class="tournament-empty">'+wheel+'<p>Preparando el sorteo de enfrentamientos…</p></div>'}
    else {bracketEl.innerHTML='<div class="tournament-round"><h3>SEMIFINALES</h3>'+semis+'</div><div class="tournament-round"><h3>FINAL</h3>'+matchHtml(state.final,'final',0)+'</div><div class="tournament-champion"><div><small>PRÓXIMO PASO</small><strong>'+(state.final?'Selecciona al ganador del combate':'Juega las semifinales')+'</strong></div></div>';statusEl.textContent=state.round==='final'?'Final lista · selecciona quién gana el combate':'Torneo iniciado · selecciona el ganador de cada combate'}
    bracketEl.querySelectorAll('button[data-winner]').forEach(b=>b.onclick=()=>pickWinner(b.dataset.round,Number(b.dataset.index),b.dataset.winner));
  }
  startBtn.textContent='🎰 Sortear torneo';
  startBtn.onclick=start;
  resetBtn.onclick=()=>{state=null;localStorage.removeItem(KEY);render()};
  render();
})();
