const $ = s => document.querySelector(s);
const teamsEl = $('#teams');
const statusEl = $('#status');
const namesEl = $('#playerNames');
const versusEl = $('#versusResult');
const SETTINGS_KEY='qbr-settings-v2';
const NAMES_KEY='qbr-player-names-v1';
const MATCHUP_KEY='qbr-versus-v1';
const cfg = () => ({players:+$('#players').value, teamSize:+$('#teamSize').value, level:+$('#level').value, mode:$('#mode').value, legendaries:$('#legendaries').checked, unique:$('#unique').checked, perfectIv:$('#perfectIv').checked});

const legendaryIds = new Set([144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721,772,773,785,786,787,788,789,790,791,792,800,801,802,807,808,809,888,889,890,891,892,893,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1024,1025]);
const strong = new Set([6,9,65,68,94,130,131,143,149,169,181,196,197,208,212,214,227,230,242,248,254,257,260,282,289,306,330,350,373,376,405,407,445,448,450,461,462,464,468,472,473,475,477,479,485,530,534,547,553,555,560,561,567,571,576,579,584,589,598,609,612,625,628,635,637,663,681,700,706,713,715,724,730,738,743,748,750,763,768,778,784,812,815,818,823,826,834,839,841,842,844,849,858,861,862,863,865,867,869,887,901,902,903,904,908,911,914,923,937,959,964,968,970,973,977,980,981,983,998,1000,1010,1013,1017,1018,1019,1020,1021,1022,1023]);

let pokemon = [];
let currentTeams = [];
let currentMatchup = JSON.parse(localStorage.getItem(MATCHUP_KEY) || 'null');
let playerNames = JSON.parse(localStorage.getItem(NAMES_KEY) || '["Jugador 1","Jugador 2","Jugador 3","Jugador 4"]');
while(playerNames.length<4) playerNames.push(`Jugador ${playerNames.length+1}`);

function saveNames(){
  localStorage.setItem(NAMES_KEY,JSON.stringify(playerNames));
}
function saveSettings(){
  localStorage.setItem(SETTINGS_KEY,JSON.stringify(cfg()));
}
function loadSettings(){
  try{
    const s=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null');
    if(!s) return;
    $('#players').value=String(s.players ?? 4);
    $('#teamSize').value=String(s.teamSize ?? 6);
    $('#level').value=String(s.level ?? 100);
    $('#mode').value=s.mode || 'balanced';
    $('#legendaries').checked=!!s.legendaries;
    $('#unique').checked=s.unique!==false;
    $('#perfectIv').checked=s.perfectIv!==false;
  }catch{}
}
function renderPlayerInputs(){
  const count=+$('#players').value;
  namesEl.innerHTML='';
  for(let i=0;i<count;i++){
    const input=document.createElement('input');
    input.className='player-name-input';
    input.type='text';
    input.maxLength=20;
    input.placeholder=`Jugador ${i+1}`;
    input.value=playerNames[i] || `Jugador ${i+1}`;
    input.setAttribute('aria-label',`Nombre del jugador ${i+1}`);
    input.addEventListener('input',()=>{
      playerNames[i]=input.value.trimStart();
      saveNames();
      if(currentTeams.length) render();
      renderVersus();
    });
    namesEl.appendChild(input);
  }
}
function displayName(i){
  const value=(playerNames[i]||'').trim();
  return value || `Jugador ${i+1}`;
}

function shuffle(values){
  const a=[...values];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function randomizeVersus(){
  const count=+$('#players').value;
  const order=shuffle(Array.from({length:count},(_,i)=>i));
  if(count===4){
    currentMatchup={players:4,teamA:[order[0],order[1]],teamB:[order[2],order[3]]};
  }else if(count===3){
    currentMatchup={players:3,teamA:[order[0]],teamB:[order[1]],bye:order[2]};
  }else{
    currentMatchup={players:2,teamA:[order[0]],teamB:[order[1]]};
  }
  localStorage.setItem(MATCHUP_KEY,JSON.stringify(currentMatchup));
  renderVersus();
}
function renderVersus(){
  const count=+$('#players').value;
  if(!currentMatchup || currentMatchup.players!==count){
    versusEl.textContent='Pulsa “Randomizar VS”.';
    return;
  }
  const names=ids=>ids.map(displayName).join(' + ');
  const left=names(currentMatchup.teamA);
  const right=names(currentMatchup.teamB);
  versusEl.innerHTML=`<div class="side"><span class="side-label">Equipo A</span><strong>${left}</strong></div><div class="vs-badge">VS</div><div class="side"><span class="side-label">Equipo B</span><strong>${right}</strong></div>${currentMatchup.bye!==undefined?`<div class="bye">Descansa: <strong>${displayName(currentMatchup.bye)}</strong></div>`:''}`;
}

async function loadPokemon(){
  statusEl.textContent='Cargando Pokédex…';
  const cached = localStorage.getItem('qbr-pokemon-v1');
  if(cached){ pokemon = JSON.parse(cached); statusEl.textContent='Pokédex lista. 🎮'; return; }
  try{
    const res=await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
    const data=await res.json();
    pokemon=data.results.map((p,i)=>({id:i+1,name:p.name}));
    localStorage.setItem('qbr-pokemon-v1',JSON.stringify(pokemon));
    statusEl.textContent='Pokédex lista. 🎮';
  }catch(e){
    statusEl.textContent='No pude cargar la Pokédex. Revisa tu conexión e intenta otra vez.';
    throw e;
  }
}

function poolFor(c){ return pokemon.filter(p=>c.legendaries || !legendaryIds.has(p.id)); }
function rand(a){ return a[Math.floor(Math.random()*a.length)]; }
function pick(pool, used, c, target='any'){
  let candidates=pool.filter(p=>!c.unique || !used.has(p.id));
  if(c.mode==='balanced' && target!=='any'){
    const filtered=candidates.filter(p=>target==='strong'?strong.has(p.id):!strong.has(p.id));
    if(filtered.length) candidates=filtered;
  }
  const p=rand(candidates); if(c.unique && p) used.add(p.id); return p;
}

function generateAll(){
  const c=cfg(), pool=poolFor(c), need=c.players*c.teamSize;
  if(c.unique && pool.length<need){ statusEl.textContent='No hay suficientes especies con esos filtros.'; return; }
  saveSettings();
  const used=new Set(); currentTeams=[];
  for(let t=0;t<c.players;t++){
    const team=[];
    for(let i=0;i<c.teamSize;i++){
      const target=c.mode==='balanced' ? (i<Math.ceil(c.teamSize/2)?'strong':'normal') : 'any';
      team.push(pick(pool,used,c,target));
    }
    currentTeams.push(team);
  }
  render();
  statusEl.textContent=`${c.players} equipos generados · Nivel ${c.level}${c.perfectIv?' · IV 31':''}`;
}

function rerollOne(ti,pi){
  const c=cfg(), pool=poolFor(c), used=new Set();
  if(c.unique) currentTeams.forEach((team,t)=>team.forEach((p,i)=>{if(!(t===ti&&i===pi))used.add(p.id)}));
  currentTeams[ti][pi]=pick(pool,used,c,'any'); render();
}
function rerollTeam(ti){
  const c=cfg(), pool=poolFor(c), used=new Set();
  if(c.unique) currentTeams.forEach((team,t)=>{if(t!==ti)team.forEach(p=>used.add(p.id))});
  currentTeams[ti]=Array.from({length:c.teamSize},(_,i)=>pick(pool,used,c,c.mode==='balanced'&&i<Math.ceil(c.teamSize/2)?'strong':'any'));
  render();
}

function render(){
  const c=cfg(); teamsEl.innerHTML='';
  currentTeams.forEach((team,ti)=>{
    const node=$('#teamTemplate').content.cloneNode(true);
    node.querySelector('h2').textContent=displayName(ti);
    node.querySelector('.reroll-team').onclick=()=>rerollTeam(ti);
    const grid=node.querySelector('.pokemon-grid');
    team.forEach((p,pi)=>{
      const card=$('#pokemonTemplate').content.cloneNode(true);
      const img=card.querySelector('img');
      img.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${p.id}.png`;
      img.alt=p.name;
      card.querySelector('.name').textContent=p.name.replaceAll('-',' ');
      card.querySelector('.meta').textContent=`Nv. ${c.level}${c.perfectIv?' · IV 31':''} · #${String(p.id).padStart(4,'0')}`;
      card.querySelector('.reroll-one').onclick=()=>rerollOne(ti,pi);
      grid.appendChild(card);
    });
    teamsEl.appendChild(node);
  });
}

$('#rollBtn').addEventListener('click',()=>pokemon.length?generateAll():loadPokemon().then(generateAll));
$('#versusBtn').addEventListener('click',randomizeVersus);
$('#players').addEventListener('change',()=>{renderPlayerInputs();saveSettings();if(currentTeams.length) currentTeams=currentTeams.slice(0,+$('#players').value),render();renderVersus();});
['teamSize','level','mode','legendaries','unique','perfectIv'].forEach(id=>$('#'+id).addEventListener('change',saveSettings));
loadSettings();
renderPlayerInputs();
renderVersus();
loadPokemon().catch(()=>{});

let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false;});
$('#installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').hidden=true;});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
