/* V15 — reset VS on new round + move alignments under team roulette */
(function(){
  function moveAlignmentsUnderTeamWheel(){
    const forge=document.querySelector('.forge-panel');
    const head=document.querySelector('.results-head');
    const teams=document.querySelector('#teams');
    if(!forge||!head||!teams||forge.querySelector('.forge-alignments'))return;
    const wrap=document.createElement('div');
    wrap.className='forge-alignments';
    forge.appendChild(wrap);
    wrap.appendChild(head);
    wrap.appendChild(teams);
  }

  function resetVersusForNewRound(){
    try{currentMatchup=null;}catch{}
    try{localStorage.removeItem(MATCHUP_KEY);}catch{}
    try{
      wheelRotation=0;
      wheelEl.style.transition='none';
      wheelEl.style.transform='rotateZ(0deg)';
      requestAnimationFrame(()=>requestAnimationFrame(()=>{wheelEl.style.transition='';}));
    }catch{}
    try{renderRoulette();}catch{}
    try{renderVersus(false);}catch{}
  }

  moveAlignmentsUnderTeamWheel();

  const spin=document.querySelector('#teamSpinBtn');
  if(spin){
    spin.addEventListener('click',()=>{
      let isNewRound=false;
      try{isNewRound=draftIndex>=Number(document.querySelector('#players')?.value||0);}catch{}
      if(isNewRound)resetVersusForNewRound();
    },true);
  }

  /* Keep the layout correct if another patch re-renders/moves nodes. */
  window.addEventListener('pageshow',moveAlignmentsUnderTeamWheel);
})();
