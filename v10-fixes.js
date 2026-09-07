/* V10 — fixed six-slot wheel + Pokemon trainer sprites + compact four-player VS card */
(function(){
  const trainerSprites=['red','leaf','ethan','lyra','brendan','may','lucas','dawn','hilbert','hilda','nate','rosa','calem','serena','elio','selene','victor','gloria'];
  function pokemonTrainerUrl(seed){
    let hash=0;const s=String(seed||'trainer');for(let i=0;i<s.length;i++)hash=((hash<<5)-hash+s.charCodeAt(i))|0;
    const name=trainerSprites[Math.abs(hash)%trainerSprites.length];
    return `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`;
  }
  window.trainerUrl=pokemonTrainerUrl;

  /* Always show exactly six visual slots. */
  window.renderTeamWheelPreview=function(ids=fallbackPreviewIds,showDex=false){
    teamSpriteLayer.innerHTML='';
    const six=(ids||[]).filter(Boolean).slice(0,6);
    while(six.length<6) six.push(fallbackPreviewIds[six.length%fallbackPreviewIds.length]);
    six.forEach((id,i)=>{
      const angle=(-90+i*60)*Math.PI/180;
      const wrap=document.createElement('div');
      wrap.className='team-sprite-wrap v10-slot';
      wrap.style.left=`${50+Math.cos(angle)*31}%`;
      wrap.style.top=`${50+Math.sin(angle)*31}%`;
      const img=document.createElement('img');img.className='team-sprite';img.src=spriteUrl(id);img.alt='';wrap.appendChild(img);
      if(showDex){const badge=document.createElement('span');badge.className='dex-badge';badge.textContent=dex(id);wrap.appendChild(badge)}
      teamSpriteLayer.appendChild(wrap);
    });
  };

  /* Guarantee the wheel finishes at zero rotation so Pokemon are upright. */
  teamSpinBtn.addEventListener('click',()=>{
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(()=>{
      if(!teamRolling){
        teamWheel.classList.add('v10-upright');
        teamWheel.style.transition='none';
        teamWheel.style.transform='rotateZ(0deg)';
        teamRotation=0;
        requestAnimationFrame(()=>requestAnimationFrame(()=>{teamWheel.classList.remove('v10-upright');teamWheel.style.transition=''}));
      }
    },reduced?140:3250);
  },true);

  function featuredForPlayer(pi){
    const team=(currentTeams[pi]||[]).filter(Boolean);
    const p=team.length?rand(team):null;
    return p?{player:pi,id:p.id,name:p.name}:null;
  }
  window.ensureBattleMeta=function(match){
    if(!match)return match;
    const participants=[...(match.teamA||[]),...(match.teamB||[])];
    if(!match.trainerSeedsByPlayer)match.trainerSeedsByPlayer={};
    participants.forEach(pi=>{if(!match.trainerSeedsByPlayer[pi])match.trainerSeedsByPlayer[pi]=`pokemon-trainer-${pi}-${Math.random().toString(36).slice(2)}`});
    if(!match.featuredByPlayer)match.featuredByPlayer={};
    participants.forEach(pi=>{const f=featuredForPlayer(pi);if(f)match.featuredByPlayer[pi]=f});
    return match;
  };
  function fighter(pi,side){
    const f=currentMatchup.featuredByPlayer?.[pi]||featuredForPlayer(pi);
    const seed=currentMatchup.trainerSeedsByPlayer?.[pi]||`pokemon-trainer-${pi}`;
    const poke=f?`<img class="v10-pokemon" src="${artworkUrl(f.id)}" alt="${f.name}">`:'';
    const info=f?`${f.name.replaceAll('-',' ')} · ${dex(f.id)}`:'Sin equipo';
    return `<div class="v10-fighter ${side}"><div class="v10-stage"><img class="v10-trainer" src="${pokemonTrainerUrl(seed)}" alt="Entrenador Pokémon de ${displayName(pi)}">${poke}</div><div class="v10-fighter-info"><strong>J${pi+1} · ${displayName(pi)}</strong><span>${info}</span></div></div>`;
  }
  function squad(side,ids){return `<div class="v10-squad ${side}">${ids.map(pi=>fighter(pi,side)).join('')}</div>`}
  window.renderVersus=function(reveal=false){
    versusEl.classList.remove('reveal');
    if(!currentMatchup||currentMatchup.players!==+$('#players').value){versusEl.innerHTML='<div class="versus-placeholder">Gira la ruleta para revelar la combinación.</div>';return}
    currentMatchup=ensureBattleMeta(currentMatchup);localStorage.setItem(MATCHUP_KEY,JSON.stringify(currentMatchup));
    const bye=currentMatchup.bye!==undefined?` · Descansa ${displayName(currentMatchup.bye)}`:'';
    versusEl.innerHTML=`<div class="battle-card battle-card-v10${reveal?' reveal':''}"><div class="battle-card-head"><span class="battle-team-label a">EQUIPO A</span><span class="battle-card-title">${currentMatchup.players===4?'BATALLA DOBLE':'BATALLA'}</span><span class="battle-team-label b">EQUIPO B</span></div><div class="battle-arena-v10">${squad('a',currentMatchup.teamA)}<div class="battle-vs-core v10">VS</div>${squad('b',currentMatchup.teamB)}</div><div class="battle-footer"><div class="a battle-dex">${names(currentMatchup.teamA)}</div><div class="battle-footer-center">${currentMatchup.players===4?'2 CONTRA 2':'ENFRENTAMIENTO'}${bye}</div><div class="b battle-dex">${names(currentMatchup.teamB)}</div></div></div>`;
  };

  /* Repair current screen immediately after this patch loads. */
  renderTeamChips();
  if(currentTeams.length&&draftIndex>0){const last=currentTeams[Math.min(draftIndex-1,currentTeams.length-1)];if(last)renderTeamWheelPreview(last.map(p=>p?.id).filter(Boolean),true)}
  else renderTeamWheelPreview();
  if(currentMatchup)renderVersus(false);
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw-v10.js');
})();
