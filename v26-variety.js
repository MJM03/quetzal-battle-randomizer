(function(){
  const HISTORY_KEY='qbr-variety-history-v1';
  const SNAP_KEY='qbr-variety-snapshot-v1';
  const MAX_HISTORY=900;
  const readJSON=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||f)}catch{return f}};
  let history=readJSON(HISTORY_KEY,[]).filter(Number.isInteger);
  let previous=readJSON(SNAP_KEY,[]);
  let busy=false;
  function saveHistory(){const unique=[...new Set(history)];if(unique.length>MAX_HISTORY)history=unique.slice(unique.length-MAX_HISTORY);localStorage.setItem(HISTORY_KEY,JSON.stringify(history))}
  function addHistory(ids){ids.forEach(id=>{if(Number.isInteger(id)&&!history.includes(id))history.push(id)});saveHistory()}
  function teams(){return readJSON('qbr-teams-v7',[])}
  function draft(){return +(localStorage.getItem('qbr-draft-index-v7')||0)}
  function playerCount(){const el=document.querySelector('#players');return el?+el.value:4}
  function ids(team){return(team||[]).map(p=>p&&p.id).filter(Number.isInteger)}
  function snapshot(){return teams().map(ids)}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
  function buttonFor(ti,pi){const cards=document.querySelectorAll('#teams .team-card');const card=cards[ti];return card?.querySelectorAll('.reroll-one')[pi]||null}
  function currentIds(){return snapshot().flat()}
  function markVarietyStatus(){const status=document.querySelector('#status');if(!status)return;const base=status.textContent||'Pokédex lista';if(!/🎲/.test(base))status.textContent=`${base} · 🎲 ${history.length} descartados`}
  async function resolveRepeatedSlots(){
    if(busy)return;
    const now=teams();if(!now.length)return;
    const changed=[];
    now.forEach((team,ti)=>(team||[]).forEach((p,pi)=>{const id=p?.id,old=previous[ti]?.[pi];if(Number.isInteger(id)&&id!==old)changed.push({ti,pi,id})}));
    if(!changed.length)return;
    busy=true;
    try{
      for(const slot of changed){
        let attempts=0,latest=teams(),id=latest[slot.ti]?.[slot.pi]?.id;
        while(Number.isInteger(id)&&history.includes(id)&&attempts<25){
          const btn=buttonFor(slot.ti,slot.pi);if(!btn)break;attempts++;btn.click();await new Promise(r=>setTimeout(r,55));latest=teams();id=latest[slot.ti]?.[slot.pi]?.id;
        }
      }
      previous=snapshot();localStorage.setItem(SNAP_KEY,JSON.stringify(previous));
      if(draft()>=playerCount()&&currentIds().length)addHistory(currentIds());
      markVarietyStatus();
    }finally{busy=false}
  }
  function init(){const initial=snapshot();if(!history.length&&initial.length)addHistory(currentIds());previous=initial;localStorage.setItem(SNAP_KEY,JSON.stringify(previous));markVarietyStatus();setInterval(()=>{const now=snapshot();if(!same(now,previous))resolveRepeatedSlots()},250)}
  window.QBRVariety={clear:function(){history=[];saveHistory();markVarietyStatus()},getHistory:()=>history.slice()};
  init();
})();