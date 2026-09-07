(()=>{
  const teamWheelFace=document.querySelector('.team-wheel-face');
  const forgeStage=document.querySelector('.forge-stage');
  const wheelMarkers=document.querySelector('#wheelMarkers');
  const rouletteOptions=document.querySelector('#rouletteOptions');
  if(!teamWheelFace||!forgeStage)return;

  const sprite=id=>`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
  const fallback=[445,94,260,149,376,700];

  const caption=document.createElement('div');
  caption.className='forge-caption';
  caption.textContent='Randomizando equipos…';
  forgeStage.appendChild(caption);

  const slots=document.createElement('div');
  slots.className='team-poke-slots';
  teamWheelFace.appendChild(slots);

  function getPreviewIds(){
    try{
      const teams=JSON.parse(localStorage.getItem('qbr-teams-v5')||'[]');
      const ids=teams.flat().filter(Boolean).map(p=>p.id).filter(Boolean);
      if(ids.length>=6)return ids.slice(0,6);
    }catch{}
    return fallback;
  }

  function drawTeamSprites(ids=getPreviewIds()){
    slots.innerHTML='';
    const pts=[[50,13],[79,31],[79,68],[50,86],[21,68],[21,31]];
    pts.forEach((pt,i)=>{
      const el=document.createElement('div');
      el.className='team-poke-slot';
      el.style.left=pt[0]+'%'; el.style.top=pt[1]+'%';
      const img=document.createElement('img');
      img.src=sprite(ids[i%ids.length]);
      img.alt=''; img.decoding='async';
      el.appendChild(img); slots.appendChild(el);
    });
  }

  function randomPreview(){
    const ids=Array.from({length:6},()=>1+Math.floor(Math.random()*1025));
    drawTeamSprites(ids);
  }

  drawTeamSprites();

  const rollBtn=document.querySelector('#rollBtn');
  if(rollBtn){
    rollBtn.addEventListener('click',()=>{
      caption.textContent='Randomizando equipos…';
      let n=0;
      const timer=setInterval(()=>{randomPreview();n++;if(n>10)clearInterval(timer)},210);
      setTimeout(()=>{drawTeamSprites();caption.textContent='Equipos listos'},3150);
    },true);
  }

  function syncVsLabels(){
    if(!wheelMarkers||!rouletteOptions)return;
    const mains=[...rouletteOptions.querySelectorAll('.option-main')].map(el=>el.textContent.trim());
    [...wheelMarkers.querySelectorAll('.wheel-marker span')].forEach((el,i)=>{
      if(mains[i]) el.textContent=mains[i].replace(' VS ','\nVS\n');
      el.style.whiteSpace='pre-line';
    });
  }

  const obs=new MutationObserver(()=>requestAnimationFrame(syncVsLabels));
  if(wheelMarkers)obs.observe(wheelMarkers,{childList:true,subtree:true});
  if(rouletteOptions)obs.observe(rouletteOptions,{childList:true,subtree:true,characterData:true});
  syncVsLabels();
})();
