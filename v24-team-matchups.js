(function(){
  function matchupOptions(){
    const n=+$('#players').value;
    if(n===4)return[
      {players:4,teamA:[0,1],teamB:[2,3],format:'2v2'},
      {players:4,teamA:[0,2],teamB:[1,3],format:'2v2'},
      {players:4,teamA:[0,3],teamB:[1,2],format:'2v2'},
      {players:4,teamA:[0,1,2],teamB:[3],format:'3v1'},
      {players:4,teamA:[0,1,3],teamB:[2],format:'3v1'},
      {players:4,teamA:[0,2,3],teamB:[1],format:'3v1'},
      {players:4,teamA:[1,2,3],teamB:[0],format:'3v1'}
    ];
    if(n===3)return[
      {players:3,teamA:[1],teamB:[2],bye:0,format:'1v1'},
      {players:3,teamA:[0],teamB:[2],bye:1,format:'1v1'},
      {players:3,teamA:[0],teamB:[1],bye:2,format:'1v1'}
    ];
    return[
      {players:2,teamA:[0],teamB:[1],format:'1v1'},
      {players:2,teamA:[1],teamB:[0],format:'1v1'}
    ];
  }
  function matchupText(o){
    if(o.format==='3v1')return{main:`${names(o.teamA)} VS ${names(o.teamB)}`,sub:'3 contra 1'};
    if(o.format==='2v2')return{main:`${names(o.teamA)} VS ${names(o.teamB)}`,sub:'2 contra 2'};
    if(o.players===3)return{main:`${names(o.teamA)} VS ${names(o.teamB)}`,sub:`Descansa ${displayName(o.bye)}`};
    return{main:`${names(o.teamA)} VS ${names(o.teamB)}`,sub:'1 contra 1'};
  }
  function wheelText(o){
    if(o.format==='3v1'||o.format==='2v2')return `${o.teamA.map(i=>`J${i+1}`).join(' + ')}\\nVS\\n${o.teamB.map(i=>`J${i+1}`).join(' + ')}`;
    if(o.players===3)return `${o.teamA.map(i=>`J${i+1}`).join(' + ')} VS ${o.teamB.map(i=>`J${i+1}`).join(' + ')}\\nDescansa J${o.bye+1}`;
    return `J${o.teamA[0]+1}\\nVS\\nJ${o.teamB[0]+1}`;
  }
  window.getMatchOptions=matchupOptions;
  window.optionText=matchupText;
  window.compactWheelText=wheelText;
  window.renderRoulette=function(){
    const opts=matchupOptions(),span=360/opts.length;
    wheelEl.style.background=`conic-gradient(from -90deg,${opts.map((_,i)=>`${optionColors[i%optionColors.length]} ${(i/opts.length)*100}% ${((i+1)/opts.length)*100}%`).join(',')})`;
    wheelMarkersEl.innerHTML='';rouletteOptionsEl.innerHTML='';
    opts.forEach((o,i)=>{
      const m=document.createElement('div');m.className='wheel-marker';const a=(-90+span*(i+.5))*Math.PI/180;
      m.style.left=`${50+Math.cos(a)*29}%`;m.style.top=`${50+Math.sin(a)*29}%`;m.style.transform='translate(-50%,-50%)';
      const s=document.createElement('span');s.textContent=wheelText(o);s.style.whiteSpace='pre-line';m.appendChild(s);wheelMarkersEl.appendChild(m);
      const item=document.createElement('div');item.className='roulette-option'+(currentMatchup?.optionIndex===i?' is-winner':'');const t=matchupText(o);
      item.innerHTML=`<div class="option-main">${t.main}</div><div class="option-sub">${t.sub}</div>`;rouletteOptionsEl.appendChild(item);
    });
  };
  window.renderVersus=function(reveal=false){
    versusEl.classList.remove('reveal');
    if(!currentMatchup||currentMatchup.players!==+$('#players').value){versusEl.innerHTML='<div class="versus-placeholder">Gira la ruleta para revelar la combinación.</div>';return;}
    currentMatchup=ensureBattleMeta(currentMatchup);localStorage.setItem(MATCHUP_KEY,JSON.stringify(currentMatchup));
    const a=currentMatchup.featured?.a,b=currentMatchup.featured?.b,bye=currentMatchup.bye!==undefined?` · Descansa ${displayName(currentMatchup.bye)}`:'';
    const format=currentMatchup.format||((currentMatchup.players===4)?'2v2':'1v1');
    const formatLabel=format==='3v1'?'3 CONTRA 1':format==='2v2'?'2 CONTRA 2':'ENFRENTAMIENTO';
    const title=format==='3v1'?'BATALLA 3 VS 1':format==='2v2'?'BATALLA DOBLE':'BATALLA';
    versusEl.innerHTML=`<div class="battle-card${reveal?' reveal':''}"><div class="battle-card-head"><span class="battle-team-label a">EQUIPO A · ${currentMatchup.teamA.length}</span><span class="battle-card-title">${title}</span><span class="battle-team-label b">EQUIPO B · ${currentMatchup.teamB.length}</span></div><div class="battle-arena">${sideMarkup('a',currentMatchup.teamA,a,currentMatchup.trainerSeeds[0])}<div class="battle-vs-core">VS</div>${sideMarkup('b',currentMatchup.teamB,b,currentMatchup.trainerSeeds[1])}</div><div class="battle-footer"><div class="a battle-dex">${a?`${displayName(a.player)} · ${dex(a.id)}`:'Sin Pokémon generado'}</div><div class="battle-footer-center">${formatLabel}${bye}</div><div class="b battle-dex">${b?`${displayName(b.player)} · ${dex(b.id)}`:'Sin Pokémon generado'}</div></div></div>`;
  };
  window.randomizeVersus=function(){
    if(spinning)return;spinning=true;ensureAudio();
    const btn=$('#versusBtn'),opts=matchupOptions(),winner=Math.floor(Math.random()*opts.length),next=ensureBattleMeta({...opts[winner],optionIndex:winner});
    const span=360/opts.length,target=((-(winner+.5)*span)%360+360)%360,current=((wheelRotation%360)+360)%360;
    wheelRotation+=5*360+(target-current+360)%360;btn.disabled=true;versusEl.innerHTML='<div class="versus-placeholder">Sorteando enfrentamiento…</div>';wheelEl.style.transform=`rotateZ(${wheelRotation}deg)`;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let ticks=reduced?null:setInterval(()=>tone(1180,.025,.014),105);
    setTimeout(()=>{if(ticks)clearInterval(ticks);currentMatchup=next;localStorage.setItem(MATCHUP_KEY,JSON.stringify(currentMatchup));spinning=false;btn.disabled=false;renderRoulette();renderVersus(true);successSound();confetti()},reduced?80:3650);
  };
  $('#versusBtn').onclick=window.randomizeVersus;
  renderRoulette();renderVersus();
})();
