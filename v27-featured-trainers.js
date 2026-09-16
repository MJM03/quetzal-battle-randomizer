/* V27 — VS limpio: 4 entrenadores + su Pokémon destacado */
(function(){
  const TRAINERS=['red','brendan','may','dawn'];
  const TRAINER_LABELS=['Red','Brendan','May','Dawn'];
  const TRAINER_BASE='https://play.pokemonshowdown.com/sprites/trainers/';

  function trainerFor(i){
    const seed=currentMatchup?.trainerSeeds?.[i];
    if(seed && typeof seed==='string'){
      let h=0;for(let n=0;n<seed.length;n++)h=((h<<5)-h+seed.charCodeAt(n))|0;
      const k=Math.abs(h)%TRAINERS.length;
      return {slug:TRAINERS[k],label:TRAINER_LABELS[k]};
    }
    return {slug:TRAINERS[i%TRAINERS.length],label:TRAINER_LABELS[i%TRAINERS.length]};
  }

  function featuredPokemon(i){
    const team=currentTeams?.[i]||[];
    return team.find(Boolean)||null;
  }

  function pokemonName(p){return p?.displayName||String(p?.name||'Pokémon').replaceAll('-',' ')}

  function pokemonImage(p){
    if(!p?.id)return '';
    return typeof spriteUrl==='function'?spriteUrl(p.id):`https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/home/${p.id}.png`;
  }

  function featuredCard(i){
    const p=featuredPokemon(i),tr=trainerFor(i);
    if(!p)return `<div class="featured-fighter empty"><div class="featured-trainer-wrap"><img class="trainer-avatar" src="${TRAINER_BASE}${tr.slug}.png" alt="${tr.label}"></div><div class="featured-copy"><strong>J${i+1} · ${displayName(i)}</strong><span>Sin Pokémon</span></div></div>`;
    const tags=[];
    if(p.mega)tags.push('<span class="featured-tag mega">✦ MEGA</span>');
    if(typeof legendaryIds!=='undefined'&&legendaryIds.has(Number(p.id)))tags.push('<span class="featured-tag legendary">★ LEGENDARIO</span>');
    return `<div class="featured-fighter">
      <div class="featured-player"><span>J${i+1}</span><strong>${displayName(i)}</strong></div>
      <div class="featured-visual">
        <div class="featured-trainer-wrap"><img class="trainer-avatar" src="${TRAINER_BASE}${tr.slug}.png" alt="${tr.label}"></div>
        <div class="featured-pokemon-wrap"><img class="featured-pokemon" src="${pokemonImage(p)}" alt="${pokemonName(p)}" data-pokemon-id="${p.id}"></div>
      </div>
      <div class="featured-copy"><strong>${pokemonName(p)}</strong><span>${dex(p.id)} · Nv. ${cfg().level}</span>${tags.length?`<div class="featured-tags">${tags.join('')}</div>`:''}</div>
    </div>`;
  }

  function cleanBattleCard(card){
    card.querySelector('.battle-footer')?.remove();
    card.querySelectorAll('.battle-arena').forEach(n=>n.remove());
  }

  const oldRender=window.renderVersus;
  window.renderVersus=function(reveal=false){
    if(typeof oldRender==='function')oldRender(reveal);
    try{
      const card=versusEl.querySelector('.battle-card');
      if(!card||!currentMatchup)return;
      cleanBattleCard(card);
      const oldFeatured=card.querySelector('.v27-featured-grid');oldFeatured?.remove();
      const count=Math.min(+$('#players').value||4,4);
      const grid=document.createElement('div');grid.className='v27-featured-grid';
      grid.innerHTML=Array.from({length:count},(_,i)=>featuredCard(i)).join('');
      const formed=card.querySelector('.formed-teams-grid');
      if(formed)formed.after(grid);else card.appendChild(grid);
      card.classList.add('v27-clean-featured');
    }catch(err){console.error('QBR V27 featured render',err)}
  };

  if(typeof currentMatchup!=='undefined'&&currentMatchup)window.renderVersus(false);
})();
