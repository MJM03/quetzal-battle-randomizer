const $ = s => document.querySelector(s);
const teamsEl = $('#teams');
const statusEl = $('#status');
const namesEl = $('#playerNames');
const versusEl = $('#versusResult');
const wheelEl = $('#rouletteWheel');
const wheelMarkersEl = $('#wheelMarkers');
const rouletteOptionsEl = $('#rouletteOptions');
const rouletteShell = document.querySelector('.roulette-shell');
const confettiEl = $('#confetti');
const soundBtn = $('#soundBtn');
const SETTINGS_KEY='qbr-settings-v2';
const NAMES_KEY='qbr-player-names-v1';
const MATCHUP_KEY='qbr-versus-v2';
const SOUND_KEY='qbr-sound-v1';
const cfg = () => ({players:+$('#players').value, teamSize:+$('#teamSize').value, level:+$('#level').value, mode:$('#mode').value, legendaries:$('#legendaries').checked, unique:$('#unique').checked, perfectIv:$('#perfectIv').checked});

const legendaryIds = new Set([144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721,772,773,785,786,787,788,789,790,791,792,800,801,802,807,808,809,888,889,890,891,892,893,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1024,1025]);
const strong = new Set([6,9,65,68,94,130,131,143,149,169,181,196,197,208,212,214,227,230,242,248,254,257,260,282,289,306,330,350,373,376,405,407,445,448,450,461,462,464,468,472,473,475,477,479,485,530,534,547,553,555,560,561,567,571,576,579,584,589,598,609,612,625,628,635,637,663,681,700,706,713,715,724,730,738,743,748,750,763,768,778,784,812,815,818,823,826,834,839,841,842,844,849,858,861,862,863,865,867,869,887,901,902,903,904,908,911,914,923,937,959,964,968,970,973,977,980,981,983,998,1000,1010,1013,1017,1018,1019,1020,1021,1022,1023]);
const optionColors=['#2563eb','#7c3aed','#d97706','#dc2626'];

let pokemon = [];
let currentTeams = [];
let currentMatchup = JSON.parse(localStorage.getItem(MATCHUP_KEY) || 'null');
let playerNames = JSON.parse(localStorage.getItem(NAMES_KEY) || '["Jugador 1","Jugador 2","Jugador 3","Jugador 4"]');
let wheelRotation = 0;
let spinning = false;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== 'off';
let audioCtx = null;
while(playerNames.length<4) playerNames.push(`Jugador ${playerNames.length+1}`);

function saveNames(){ localStorage.setItem(NAMES_KEY,JSON.stringify(playerNames)); }
function saveSettings(){ localStorage.setItem(SETTINGS_KEY,JSON.stringify(cfg())); }
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
      renderRoulette();
      renderVersus();
    });
    namesEl.appendChild(input);
  }
}
function displayName(i){
  const value=(playerNames[i]||'').trim();
  return value || `Jugador ${i+1}`;
}
function names(ids){ return ids.map(displayName).join(' + '); }

function getMatchOptions(){
  const count=+$('#players').value;
  if(count===4){
    return [
      {players:4,teamA:[0,1],teamB:[2,3]},
      {players:4,teamA:[0,2],teamB:[1,3]},
      {players:4,teamA:[0,3],teamB:[1,2]}
    ];
  }
  if(count===3){
    return [
      {players:3,teamA:[1],teamB:[2],bye:0},
      {players:3,teamA:[0],teamB:[2],bye:1},
      {players:3,teamA:[0],teamB:[1],bye:2}
    ];
  }
  return [
    {players:2,teamA:[0],teamB:[1]},
    {players:2,teamA:[1],teamB:[0]}
  ];
}
function optionText(option){
  if(option.players===3) return {main:`${names(option.teamA)} VS ${names(option.teamB)}`,sub:`Descansa ${displayName(option.bye)}`};
  if(option.players===2) return {main:`${names(option.teamA)} VS ${names(option.teamB)}`,sub:'Cambia el lado de salida'};
  return {main:`${names(option.teamA)} VS ${names(option.teamB)}`,sub:'Dupla contra dupla'};
}
function renderRoulette(){
  const options=getMatchOptions();
  const span=360/options.length;
  const stops=[];
  options.forEach((_,i)=>{
    const start=(i/options.length)*100;
    const end=((i+1)/options.length)*100;
    stops.push(`${optionColors[i]} ${start}% ${end}%`);
  });
  wheelEl.style.background=`conic-gradient(from -90deg,${stops.join(',')})`;
  wheelMarkersEl.innerHTML='';
  rouletteOptionsEl.innerHTML='';

  options.forEach((option,i)=>{
    const marker=document.createElement('div');
    marker.className='wheel-marker';
    const center=-90+span*(i+.5);
    const angle=center*Math.PI/180;
    marker.style.left=`${50+Math.cos(angle)*35}%`;
    marker.style.top=`${50+Math.sin(angle)*35}%`;
    marker.style.transform='translate(-50%,-50%)';
    const bubble=document.createElement('span');
    bubble.textContent=String(i+1);
    marker.appendChild(bubble);
    wheelMarkersEl.appendChild(marker);

    const item=document.createElement('div');
    item.className='roulette-option';
    item.dataset.option=String(i);
    const swatch=document.createElement('span');
    swatch.className='option-color';
    swatch.style.background=optionColors[i];
    const num=document.createElement('span');
    num.className='option-index';
    num.textContent=String(i+1);
    const copy=document.createElement('div');
    copy.className='option-copy';
    const main=document.createElement('div');
    main.className='option-main';
    const sub=document.createElement('div');
    sub.className='option-sub';
    const text=optionText(option);
    main.textContent=text.main;
    sub.textContent=text.sub;
    copy.append(main,sub);
    item.append(swatch,num,copy);
    rouletteOptionsEl.appendChild(item);
  });
  highlightWinningOption(currentMatchup?.optionIndex);
}
function highlightWinningOption(index){
  rouletteOptionsEl.querySelectorAll('.roulette-option').forEach((el,i)=>el.classList.toggle('is-winner',i===index));
}
function setVersusLoading(){
  versusEl.classList.remove('reveal');
  versusEl.innerHTML='<div class="versus-placeholder">🎯 Sorteando una de las opciones…</div>';
  highlightWinningOption(undefined);
}
function ensureAudio(){
  if(!soundEnabled) return null;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC) return null;
  if(!audioCtx) audioCtx=new AC();
  if(audioCtx.state==='suspended') audioCtx.resume();
  return audioCtx;
}
function tone(freq,duration=.04,volume=.035,type='square',delay=0){
  const ctx=ensureAudio();
  if(!ctx) return;
  const osc=ctx.createOscillator();
  const gain=ctx.createGain();
  const t=ctx.currentTime+delay;
  osc.type=type; osc.frequency.setValueAtTime(freq,t);
  gain.gain.setValueAtTime(volume,t);
  gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t); osc.stop(t+duration+.01);
}
function playResultSound(){
  tone(523,.08,.05,'sine',0);
  tone(659,.09,.045,'sine',.09);
  tone(784,.14,.05,'sine',.18);
}
function launchConfetti(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  confettiEl.innerHTML='';
  for(let i=0;i<34;i++){
    const piece=document.createElement('i');
    piece.className='confetti-piece';
    piece.style.background=optionColors[i%optionColors.length];
    piece.style.setProperty('--x',`${Math.round((Math.random()-.5)*520)}px`);
    piece.style.setProperty('--y',`${Math.round(-80+Math.random()*330)}px`);
    piece.style.setProperty('--r',`${Math.round((Math.random()-.5)*900)}deg`);
    piece.style.animationDelay=`${Math.random()*120}ms`;
    confettiEl.appendChild(piece);
  }
  setTimeout(()=>{confettiEl.innerHTML='';},1200);
}
function randomizeVersus(){
  if(spinning) return;
  spinning=true;
  ensureAudio();
  const btn=$('#versusBtn');
  const options=getMatchOptions();
  const winner=Math.floor(Math.random()*options.length);
  const next={...options[winner],optionIndex:winner};
  const span=360/options.length;
  const targetMod=((-(winner+.5)*span)%360+360)%360;
  const currentMod=((wheelRotation%360)+360)%360;
  const delta=(targetMod-currentMod+360)%360;
  wheelRotation += 5*360+delta;

  btn.disabled=true;
  rouletteShell.classList.add('is-spinning');
  setVersusLoading();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  wheelEl.style.transform=`rotate(${wheelRotation}deg)`;

  let tickTimer=null;
  if(soundEnabled && !reduced){
    tickTimer=setInterval(()=>tone(1250,.025,.018,'square'),105);
  }
  window.setTimeout(()=>{
    if(tickTimer) clearInterval(tickTimer);
    currentMatchup=next;
    localStorage.setItem(MATCHUP_KEY,JSON.stringify(currentMatchup));
    spinning=false;
    btn.disabled=false;
    rouletteShell.classList.remove('is-spinning');
    highlightWinningOption(winner);
    renderVersus(true);
    if(soundEnabled) playResultSound();
    launchConfetti();
  },reduced?80:3400);
}
function makeSide(label,ids){
  const side=document.createElement('div');
  side.className='side';
  const small=document.createElement('span');
  small.className='side-label';
  small.textContent=label;
  const strongEl=document.createElement('strong');
  strongEl.textContent=names(ids);
  side.append(small,strongEl);
  return side;
}
function renderVersus(reveal=false){
  const count=+$('#players').value;
  versusEl.classList.remove('reveal');
  versusEl.innerHTML='';
  if(!currentMatchup || currentMatchup.players!==count){
    versusEl.innerHTML='<div class="versus-placeholder">Pulsa <strong>GIRAR</strong> para sortear el VS.</div>';
    highlightWinningOption(undefined);
    return;
  }
  versusEl.appendChild(makeSide('Equipo A',currentMatchup.teamA));
  const badge=document.createElement('div');
  badge.className='vs-badge';
  badge.textContent='VS';
  versusEl.appendChild(badge);
  versusEl.appendChild(makeSide('Equipo B',currentMatchup.teamB));
  if(currentMatchup.bye!==undefined){
    const bye=document.createElement('div');
    bye.className='bye';
    bye.append('Descansa: ');
    const b=document.createElement('strong');
    b.textContent=displayName(currentMatchup.bye);
    bye.appendChild(b);
    versusEl.appendChild(bye);
  }
  highlightWinningOption(currentMatchup.optionIndex);
  if(reveal){ void versusEl.offsetWidth; versusEl.classList.add('reveal'); }
}
function updateSoundButton(){
  soundBtn.setAttribute('aria-pressed',String(soundEnabled));
  soundBtn.innerHTML=soundEnabled?'🔊 <span>Sonido</span>':'🔇 <span>Silencio</span>';
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
soundBtn.addEventListener('click',()=>{soundEnabled=!soundEnabled;localStorage.setItem(SOUND_KEY,soundEnabled?'on':'off');updateSoundButton();if(soundEnabled) tone(700,.05,.025,'sine');});
$('#players').addEventListener('change',()=>{renderPlayerInputs();saveSettings();currentMatchup=null;localStorage.removeItem(MATCHUP_KEY);renderRoulette();if(currentTeams.length) currentTeams=currentTeams.slice(0,+$('#players').value),render();renderVersus();});
['teamSize','level','mode','legendaries','unique','perfectIv'].forEach(id=>$('#'+id).addEventListener('change',saveSettings));
loadSettings();
renderPlayerInputs();
renderRoulette();
renderVersus();
updateSoundButton();
loadPokemon().catch(()=>{});

let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false;});
$('#installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').hidden=true;});
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
