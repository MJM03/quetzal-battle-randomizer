/* V9 fixes: exactly six wheel slots, upright final reveal, four trainers + four team Pokemon */
(function(){
  const oldPreview=window.renderTeamWheelPreview;
  window.renderTeamWheelPreview=function(ids=fallbackPreviewIds,showDex=false){
    teamSpriteLayer.innerHTML='';
    const six=(ids||[]).slice(0,6);
    while(six.length<6) six.push(fallbackPreviewIds[six.length%fallbackPreviewIds.length]);
    six.forEach((id,i)=>{
      const angle=(-90+i*60)*Math.PI/180;
      const wrap=document.createElement('div');
      wrap.className='team-sprite-wrap v9-slot';
      wrap.style.left=`${50+Math.cos(angle)*31}%`;
      wrap.style.top=`${50+Math.sin(angle)*31}%`;
      const img=document.createElement('img'); img.className='team-sprite'; img.src=spriteUrl(id); img.alt=''; wrap.appendChild(img);
      if(showDex){const badge=document.createElement('span');badge.className='dex-badge';badge.textContent=dex(id);wrap.appendChild(badge)}
      teamSpriteLayer.appendChild(wrap);
    });
  };

  /* The wheel may spin many turns, but the final six Pokemon always settle upright. */
  teamSpinBtn.addEventListener('click',()=>{
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(()=>{
      if(!teamRolling){
        teamWheel.classList.add('v9-settling');
        teamWheel.style.transition='none';
        teamWheel.style.transform='rotateZ(0deg)';
        teamRotation=0;
        requestAnimationFrame(()=>requestAnimationFrame(()=>{teamWheel.style.transition='';teamWheel.classList.remove('v9-settling')}));
      }
    },reduced?160:3200);
  });

  function featuredForPlayer(pi){
    const team=currentTeams[pi]||[];
    const p=team.length?rand(team.filter(Boolean)):null;
    return p?{player:pi,id:p.id,name:p.name}:null;
  }
  window.ensureBattleMeta=function(match){
    if(!match)return match;
    const participants=[...(match.teamA||[]),...(match.teamB||[])];
    if(!match.trainerSeedsByPlayer) match.trainerSeedsByPlayer={};
    participants.forEach(pi=>{if(!match.trainerSeedsByPlayer[pi])match.trainerSeedsByPlayer[pi]=`trainer-${pi}-${Math.random().toString(36).slice(2)}`});
    if(!match.featuredByPlayer) match.featuredByPlayer={};
    participants.forEach(pi=>{const f=featuredForPlayer(pi);if(f)match.featuredByPlayer[pi]=f});
    return match;
  };
  function fighter(pi,side){
    const f=currentMatchup.featuredByPlayer?.[pi]||featuredForPlayer(pi);
    const seed=currentMatchup.trainerSeedsByPlayer?.[pi]||`trainer-${pi}`;
    const poke=f?`<img class="fighter-pokemon" src="${artworkUrl(f.id)}" alt="${f.name}">`:'';
    const dexTxt=f?`${f.name.replaceAll('-',' ')} · ${dex(f.id)}`:'Sin equipo';
    return `<div class="battle-fighter ${side}"><div class="fighter-stage"><img class="fighter-trainer" src="${trainerUrl(seed)}" alt="Entrenador de ${displayName(pi)}">${poke}</div><div class="fighter-name"><strong>J${pi+1} · ${displayName(pi)}</strong><span>${dexTxt}</span></div></div>`;
  }
  function sideGroup(side,ids){return `<div class="battle-squad ${side}">${ids.map(pi=>fighter(pi,side)).join('')}</div>`}
  window.renderVersus=function(reveal=false){
    versusEl.classList.remove('reveal');
    if(!currentMatchup||currentMatchup.players!==+$('#players').value){versusEl.innerHTML='<div class="versus-placeholder">Gira la ruleta para revelar la combinación.</div>';return}
    currentMatchup=ensureBattleMeta(currentMatchup);localStorage.setItem(MATCHUP_KEY,JSON.stringify(currentMatchup));
    const bye=currentMatchup.bye!==undefined?` · Descansa ${displayName(currentMatchup.bye)}`:'';
    versusEl.innerHTML=`<div class="battle-card battle-card-v9${reveal?' reveal':''}"><div class="battle-card-head"><span class="battle-team-label a">EQUIPO A</span><span class="battle-card-title">${currentMatchup.players===4?'BATALLA DOBLE':'BATALLA'}</span><span class="battle-team-label b">EQUIPO B</span></div><div class="battle-arena-v9">${sideGroup('a',currentMatchup.teamA)}<div class="battle-vs-core v9">VS</div>${sideGroup('b',currentMatchup.teamB)}</div><div class="battle-footer"><div class="a battle-dex">${names(currentMatchup.teamA)}</div><div class="battle-footer-center">${currentMatchup.players===4?'2 CONTRA 2':'ENFRENTAMIENTO'}${bye}</div><div class="b battle-dex">${names(currentMatchup.teamB)}</div></div></div>`;
  };
  if(currentMatchup) renderVersus(false);
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw-v9.js');
})();