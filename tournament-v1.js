/* V1 — Modo Torneo independiente */
(function(){
  const KEY='qbr-tournament-v1';
  const panel=document.getElementById('tournamentPanel');
  if(!panel)return;
  const bracketEl=document.getElementById('tournamentBracket');
  const statusEl=document.getElementById('tournamentStatus');
  const startBtn=document.getElementById('tournamentStart');
  const resetBtn=document.getElementById('tournamentReset');
  let state=load();

  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function names(){const n=window.playerNames||[];const count=Number(document.getElementById('players')?.value||4);return Array.from({length:count},(_,i)=>(n[i]||'').trim()||'Jugador '+(i+1))}
  function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function makeMatch(a,b){return {a,b,winner:null}}
  function start(){
    const p=names();
    if(p.length<2)return;
    const s={players:p,round:'semis',matches:[],final:null,champion:null};
    if(p.length===2)s.round='final',s.final=makeMatch(p[0],p[1]);
    else if(p.length===3){
      const q=shuffle(p);s.round='semis';s.matches=[makeMatch(q[0],q[1])];s.final=makeMatch(null,q[2]);
    }else{
      const q=shuffle(p);s.matches=[makeMatch(q[0],q[1]),makeMatch(q[2],q[3])];
    }
    state=s;save();render();
  }
  function pickWinner(round,index,winner){
    if(!state)return;
    if(round==='semis'){
      const m=state.matches[index];if(!m||m.winner)return;
      m.winner=winner;
      if(state.matches.length===2 && state.matches.every(x=>x.winner)){
        state.final=makeMatch(state.matches[0].winner,state.matches[1].winner);state.round='final';
      }else if(state.matches.length===1 && m.winner && state.final?.b){
        state.final.a=m.winner;state.round='final';
      }else if(state.matches.length===1 && m.winner && state.final?.a){
        state.final.b=m.winner;state.round='final';
      }
    }else if(round==='final'){
      if(state.final&&!state.final.winner){state.final.winner=winner;state.champion=winner;state.round='champion'}
    }
    save();render();
  }
  function playerHtml(name,active,winner,loser,round,index){
    if(!name)return '<div class="tournament-player">Esperando…</div>';
    const button=active&&!winner&&!loser?'<button type="button" data-round="'+round+'" data-index="'+index+'" data-winner="'+name.replace(/"/g,'&quot;')+'">Gana</button>':'';
    return '<div class="tournament-player '+(active?'active ':'')+(winner?'winner ':'')+(loser?'loser':'')+'"><span>'+escapeHtml(name)+'</span>'+button+'</div>';
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function matchHtml(m,round,index){
    if(!m)return '';
    const active=!m.winner && m.a && m.b;
    const loser=m.winner?(m.winner===m.a?m.b:m.a):null;
    return '<div class="tournament-match '+(active?'current ':'')+(m.winner?'done':'')+'">'+playerHtml(m.a,active,m.winner===m.a,loser===m.a,round,index)+playerHtml(m.b,active,m.winner===m.b,loser===m.b,round,index)+'</div>';
  }
  function render(){
    if(!state){bracketEl.innerHTML='<div class="tournament-empty">Pulsa <strong>Iniciar torneo</strong> para crear un cuadro independiente.</div>';statusEl.textContent='Sin torneo activo';return}
    if(state.champion){
      bracketEl.innerHTML='<div class="tournament-round">'+matchHtml(state.matches[0],'semis',0)+(state.matches[1]?matchHtml(state.matches[1],'semis',1):'')+'</div><div class="tournament-round"><h3>FINAL</h3>'+matchHtml(state.final,'final',0)+'</div><div class="tournament-champion"><div><small>CAMPEÓN DEL TORNEO</small><strong>🏆 '+escapeHtml(state.champion)+'</strong></div></div>';
      statusEl.textContent='Torneo terminado · campeón: '+state.champion;
    }else{
      const semis=state.matches.map((m,i)=>matchHtml(m,'semis',i)).join('');
      bracketEl.innerHTML='<div class="tournament-round"><h3>SEMIFINALES</h3>'+semis+'</div><div class="tournament-round"><h3>FINAL</h3>'+matchHtml(state.final,'final',0)+'</div><div class="tournament-champion"><div><small>PRÓXIMO PASO</small><strong>'+(state.final?'Selecciona al ganador de la final':'Juega las semifinales')+'</strong></div></div>';
      statusEl.textContent=state.round==='final'?'Final lista · selecciona quién gana el combate':'Torneo iniciado · selecciona el ganador de cada combate';
    }
    bracketEl.querySelectorAll('button[data-winner]').forEach(b=>b.onclick=()=>pickWinner(b.dataset.round,Number(b.dataset.index),b.dataset.winner));
  }
  startBtn.onclick=start;
  resetBtn.onclick=()=>{state=null;localStorage.removeItem(KEY);render()};
  render();
})();
