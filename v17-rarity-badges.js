/* V17 — Mega badge only when the Mega form is actually shown; Legendary badges */
(function(){
  const showdownBase='https://play.pokemonshowdown.com/sprites/gen5/';
  const cdnBase='https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/';
  function slugify(s=''){return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function megaSlug(p){
    const d=(p?.displayName||'').toLowerCase();
    const base=(pokemon.find(x=>x.id===p?.id)?.name||p?.name||'').toLowerCase();
    if(d.includes('charizard x'))return 'charizard-megax';
    if(d.includes('charizard y'))return 'charizard-megay';
    if(d.includes('mewtwo x'))return 'mewtwo-megax';
    if(d.includes('mewtwo y'))return 'mewtwo-megay';
    return `${slugify(base)}-mega`;
  }
  function isLegendary(p){return !!p&&legendaryIds.has(Number(p.id))}
  function badge(type){const s=document.createElement('span');s.className=`poke-badge ${type}`;s.textContent=type==='mega'?'✦ MEGA':'★ LEGENDARIO';return s}
  function applyManagedImage(img,p,kind='card'){
    if(!img||!p)return;
    img.dataset.pokemonId=String(p.id);
    img.dataset.v17Managed='1';
    img.loading='eager';
    const normalName=pokemon.find(x=>x.id===p.id)?.name||p.name||'';
    const sources=p.mega?[
      `${showdownBase}${megaSlug(p)}.png`,
      `https://play.pokemonshowdown.com/sprites/ani/${megaSlug(p)}.gif`,
      `${cdnBase}other/official-artwork/${p.id}.png`,
      `${cdnBase}${p.id}.png`
    ]:[
      `${cdnBase}other/official-artwork/${p.id}.png`,
      `${cdnBase}other/home/${p.id}.png`,
      `${cdnBase}${p.id}.png`,
      `${showdownBase}${slugify(normalName)}.png`
    ];
    let n=0;
    img.alt=p.mega?megaSlug(p):normalName;
    if(p.mega)img.classList.add('v17-mega-sprite');else img.classList.remove('v17-mega-sprite');
    const fail=e=>{
      e.stopImmediatePropagation?.();
      n++;
      if(n<sources.length)img.src=sources[n];
      else{img.style.visibility='hidden';}
    };
    img.addEventListener('error',fail,true);
    img.src=sources[0];
  }
  function decorateInfo(container,p){
    if(!container)return;
    const old=container.querySelector('.poke-tags');if(old)old.remove();
    if(!p?.mega&&!isLegendary(p))return;
    const tags=document.createElement('div');tags.className='poke-tags';
    if(p.mega)tags.appendChild(badge('mega'));
    if(isLegendary(p))tags.appendChild(badge('legendary'));
    container.appendChild(tags);
  }
  window.renderTeams=function(reveal=false){
    teamsEl.innerHTML='';const c=cfg();
    currentTeams.slice(0,c.players).forEach((team,ti)=>{
      if(!team)return;
      const node=document.getElementById('teamTemplate').content.cloneNode(true),card=node.querySelector('.team-card');
      if(reveal)card.style.animationDelay=`${ti*90}ms`;
      node.querySelector('h2').textContent=`J${ti+1} · ${displayName(ti)}`;
      node.querySelector('.reroll-team').onclick=()=>rerollTeam(ti);
      const grid=node.querySelector('.pokemon-grid');
      team.forEach((p,pi)=>{
        if(!p)return;
        const pc=document.getElementById('pokemonTemplate').content.cloneNode(true),img=pc.querySelector('img');
        applyManagedImage(img,p);
        const cardEl=pc.querySelector('.pokemon-card');if(isLegendary(p))cardEl.classList.add('legendary-card');
        pc.querySelector('.name').textContent=p.displayName||String(p.name||'').replaceAll('-',' ');
        pc.querySelector('.meta').innerHTML=`<span class="dex">${dex(p.id)}</span><span>Nv. ${c.level}${c.perfectIv?' · IV31':''}</span>`;
        decorateInfo(pc.querySelector('.pokemon-info'),p);
        pc.querySelector('.reroll-one').onclick=()=>rerollOne(ti,pi);
        grid.appendChild(pc);
      });
      teamsEl.appendChild(node);
    });
  };
  window.renderTeamWheelPreview=function(ids=fallbackPreviewIds,showDex=false){
    teamSpriteLayer.innerHTML='';
    const clean=(ids||[]).filter(Boolean).slice(0,6);while(clean.length<6)clean.push(fallbackPreviewIds[clean.length%fallbackPreviewIds.length]);
    let exactTeam=null;
    if(showDex){
      exactTeam=currentTeams.find(t=>Array.isArray(t)&&t.length===clean.length&&t.every((p,i)=>p&&p.id===clean[i]))||null;
    }
    clean.forEach((id,i)=>{
      const angle=(-90+i*60)*Math.PI/180;
      const wrap=document.createElement('div');wrap.className='team-sprite-wrap v10-slot';wrap.style.left=`${50+Math.cos(angle)*31}%`;wrap.style.top=`${50+Math.sin(angle)*31}%`;
      const p=exactTeam?.[i]||{id,name:pokemon.find(x=>x.id===id)?.name||''};
      const img=document.createElement('img');img.className='team-sprite';applyManagedImage(img,p,'wheel');wrap.appendChild(img);
      if(showDex){const d=document.createElement('span');d.className='dex-badge';d.textContent=dex(id);wrap.appendChild(d)}
      if(showDex&&(p.mega||isLegendary(p))){const stack=document.createElement('span');stack.className='wheel-rarity-stack';if(p.mega)stack.appendChild(badge('mega'));if(isLegendary(p))stack.appendChild(badge('legendary'));wrap.appendChild(stack)}
      teamSpriteLayer.appendChild(wrap);
    });
  };
  if(currentTeams.length)renderTeams(false);
  const last=currentTeams[Math.min(Math.max(draftIndex-1,0),currentTeams.length-1)];
  if(last?.length)renderTeamWheelPreview(last.map(p=>p.id),true);
})();
