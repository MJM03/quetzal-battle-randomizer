/* V16 — Mega Evolutions toggle + one-Mega-per-team randomizer */
(function(){
  const MEGA_KEY='qbr-megas-enabled-v16';
  const megaToggle=document.getElementById('megas');
  if(!megaToggle)return;

  const MEGAS=[
    [3,'Mega Venusaur'],[6,'Mega Charizard X'],[6,'Mega Charizard Y'],[9,'Mega Blastoise'],[15,'Mega Beedrill'],[18,'Mega Pidgeot'],
    [65,'Mega Alakazam'],[80,'Mega Slowbro'],[94,'Mega Gengar'],[115,'Mega Kangaskhan'],[127,'Mega Pinsir'],[130,'Mega Gyarados'],
    [142,'Mega Aerodactyl'],[150,'Mega Mewtwo X'],[150,'Mega Mewtwo Y'],[181,'Mega Ampharos'],[208,'Mega Steelix'],[212,'Mega Scizor'],
    [214,'Mega Heracross'],[229,'Mega Houndoom'],[248,'Mega Tyranitar'],[254,'Mega Sceptile'],[257,'Mega Blaziken'],[260,'Mega Swampert'],
    [282,'Mega Gardevoir'],[302,'Mega Sableye'],[303,'Mega Mawile'],[306,'Mega Aggron'],[308,'Mega Medicham'],[310,'Mega Manectric'],
    [319,'Mega Sharpedo'],[323,'Mega Camerupt'],[334,'Mega Altaria'],[354,'Mega Banette'],[359,'Mega Absol'],[362,'Mega Glalie'],
    [373,'Mega Salamence'],[376,'Mega Metagross'],[380,'Mega Latias'],[381,'Mega Latios'],[428,'Mega Lopunny'],[445,'Mega Garchomp'],
    [448,'Mega Lucario'],[460,'Mega Abomasnow'],[475,'Mega Gallade'],[531,'Mega Audino'],[719,'Mega Diancie']
  ].map(([id,displayName])=>({id,displayName,mega:true}));

  const saved=localStorage.getItem(MEGA_KEY);
  megaToggle.checked=saved===null?true:saved==='on';
  megaToggle.addEventListener('change',()=>{
    localStorage.setItem(MEGA_KEY,megaToggle.checked?'on':'off');
    statusEl.textContent=megaToggle.checked?'Mega evoluciones activadas · máximo 1 por equipo':'Mega evoluciones desactivadas';
  });

  function megaEnabled(){return !!megaToggle.checked}
  function baseName(id){return pokemon.find(p=>p.id===id)?.name||`pokemon-${id}`}
  function shuffled(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function availableMega(c,used){
    return MEGAS.filter(m=>(c.legendaries||!legendaryIds.has(m.id))&&(!c.unique||!used.has(m.id))&&pokemon.some(p=>p.id===m.id));
  }
  function makeMegaPokemon(m){return {id:m.id,name:baseName(m.id),displayName:m.displayName,mega:true}}

  window.makeTeamForPlayer=function(playerIndex){
    const c=cfg(),pool=poolFor(c),used=usedAcrossTeams(playerIndex),team=[];
    const megaChance=megaEnabled()&&(Math.random() < (c.mode==='chaos' ? 0.42 : 0.35));
    if(megaChance){
      const candidates=availableMega(c,used);
      const m=candidates.length?rand(candidates):null;
      if(m){team.push(makeMegaPokemon(m));if(c.unique)used.add(m.id)}
    }
    while(team.length<c.teamSize){
      const i=team.length;
      const target=c.mode==='balanced'?(i<Math.ceil(c.teamSize/2)?'strong':'normal'):'any';
      const p=pick(pool,used,c,target);
      if(!p)break;
      team.push({...p});
    }
    return shuffled(team);
  };

  function rerollOneV16(ti,pi){
    if(!pokemon.length)return;
    const c=cfg(),pool=poolFor(c),used=usedAcrossTeams(ti),team=currentTeams[ti]||[];
    team.forEach((p,i)=>{if(i!==pi&&p)used.add(p.id)});
    const hadMega=!!team[pi]?.mega;
    const anotherMega=team.some((p,i)=>i!==pi&&p?.mega);
    let replacement=null;
    if(megaEnabled()&&!anotherMega&&hadMega&&Math.random()<0.55){
      const candidates=availableMega(c,used);const m=candidates.length?rand(candidates):null;if(m)replacement=makeMegaPokemon(m);
    }
    if(!replacement)replacement=pick(pool,used,c);
    currentTeams[ti][pi]=replacement;
    localStorage.setItem(TEAMS_KEY,JSON.stringify(currentTeams));
    renderTeams();renderVersus();
  }
  function rerollTeamV16(ti){
    if(!pokemon.length)return;
    currentTeams[ti]=window.makeTeamForPlayer(ti);
    localStorage.setItem(TEAMS_KEY,JSON.stringify(currentTeams));
    renderTeams(true);renderVersus();
  }

  window.renderTeams=function(reveal=false){
    teamsEl.innerHTML='';const c=cfg();
    currentTeams.slice(0,c.players).forEach((team,ti)=>{
      if(!team)return;
      const node=document.getElementById('teamTemplate').content.cloneNode(true),card=node.querySelector('.team-card');
      if(reveal)card.style.animationDelay=`${ti*90}ms`;
      node.querySelector('h2').textContent=`J${ti+1} · ${displayName(ti)}`;
      node.querySelector('.reroll-team').onclick=()=>rerollTeamV16(ti);
      const grid=node.querySelector('.pokemon-grid');
      team.forEach((p,pi)=>{
        if(!p)return;
        const pc=document.getElementById('pokemonTemplate').content.cloneNode(true),img=pc.querySelector('img');
        img.src=spriteUrl(p.id);img.alt=baseName(p.id);img.dataset.pokemonId=String(p.id);
        const nameEl=pc.querySelector('.name');nameEl.textContent=p.displayName||p.name.replaceAll('-',' ');
        if(p.mega){const tag=document.createElement('span');tag.className='mega-tag';tag.textContent='MEGA';nameEl.appendChild(tag)}
        pc.querySelector('.meta').innerHTML=`<span class="dex">${dex(p.id)}</span><span>Nv. ${c.level}${c.perfectIv?' · IV31':''}</span>`;
        pc.querySelector('.reroll-one').onclick=()=>rerollOneV16(ti,pi);grid.appendChild(pc);
      });
      teamsEl.appendChild(node);
    });
  };

  const oldWheel=window.renderTeamWheelPreview;
  if(typeof oldWheel==='function'){
    window.renderTeamWheelPreview=function(ids=fallbackPreviewIds,showDex=false){
      oldWheel(ids,showDex);
      if(!showDex)return;
      const ti=Math.min(draftIndex,currentTeams.length-1),team=currentTeams[ti]||[];
      const slots=[...teamSpriteLayer.children];
      team.forEach((p,i)=>{if(p?.mega&&slots[i]){const b=document.createElement('span');b.className='mega-wheel-badge';b.textContent='MEGA';slots[i].appendChild(b)}});
    };
  }

  if(currentTeams.length)renderTeams(false);
})();
