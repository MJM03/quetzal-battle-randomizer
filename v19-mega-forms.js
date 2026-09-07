/* V19 — authoritative Mega-form rendering via PokéAPI + mega-safe rerolls */
(function(){
  const CACHE_KEY='qbr-mega-sprite-cache-v19';
  let megaCache={};
  try{megaCache=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')||{}}catch{megaCache={}}

  function baseNameFor(p){return pokemon.find(x=>x.id===p?.id)?.name||p?.name||''}
  function megaApiName(p){
    if(!p?.mega)return null;
    const d=String(p.displayName||'').toLowerCase().trim();
    const base=baseNameFor(p).toLowerCase();
    if(d.includes('charizard x'))return 'charizard-mega-x';
    if(d.includes('charizard y'))return 'charizard-mega-y';
    if(d.includes('mewtwo x'))return 'mewtwo-mega-x';
    if(d.includes('mewtwo y'))return 'mewtwo-mega-y';
    return `${base}-mega`;
  }
  function showdownMegaName(apiName){
    return apiName.replace('-mega-x','-megax').replace('-mega-y','-megay').replace('-mega','-mega');
  }
  function saveMegaCache(){try{localStorage.setItem(CACHE_KEY,JSON.stringify(megaCache))}catch{}}
  async function getMegaSprite(p){
    const key=megaApiName(p);if(!key)return null;
    if(megaCache[key]?.url)return megaCache[key];
    try{
      const r=await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`,{cache:'force-cache'});
      if(!r.ok)throw new Error('mega not found');
      const data=await r.json();
      const url=data?.sprites?.other?.home?.front_default||data?.sprites?.other?.['official-artwork']?.front_default||data?.sprites?.front_default||null;
      if(!url)throw new Error('mega sprite missing');
      megaCache[key]={url,id:data.id,name:key};saveMegaCache();return megaCache[key];
    }catch{
      return {url:`https://play.pokemonshowdown.com/sprites/ani/${showdownMegaName(key)}.gif`,id:null,name:key,fallback:true};
    }
  }
  function normalSources(p){
    const id=p.id,name=baseNameFor(p);
    return [
      `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/home/${id}.png`,
      `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      `https://play.pokemonshowdown.com/sprites/gen5/${name}.png`
    ];
  }
  function setNormalImage(img,p){
    const list=normalSources(p);let i=0;img.classList.remove('mega-resolving','mega-image');img.style.visibility='visible';img.src=list[0];
    img.onerror=()=>{i++;if(i<list.length)img.src=list[i];else img.style.visibility='hidden'};
  }
  async function setPokemonImage(img,p){
    if(!p?.mega){setNormalImage(img,p);return;}
    img.onerror=null;img.removeAttribute('src');img.style.visibility='hidden';img.classList.add('mega-resolving');
    const resolved=await getMegaSprite(p);
    if(!resolved?.url){img.classList.remove('mega-resolving');img.style.visibility='hidden';return;}
    img.onload=()=>{img.style.visibility='visible';img.classList.remove('mega-resolving');img.classList.add('mega-image')};
    img.onerror=()=>{
      if(!resolved.fallback){img.src=`https://play.pokemonshowdown.com/sprites/ani/${showdownMegaName(megaApiName(p))}.gif`;resolved.fallback=true;}
      else{img.style.visibility='hidden';img.classList.remove('mega-resolving')}
    };
    img.alt=p.displayName||'Mega Pokémon';img.dataset.pokemonId=String(p.id);img.src=resolved.url;
  }
  function isLegendary(p){return !!p&&legendaryIds.has(Number(p.id))}
  function badge(type){const s=document.createElement('span');s.className=`poke-badge ${type}`;s.textContent=type==='mega'?'✦ MEGA':'★ LEGENDARIO';return s}
  function decorate(container,p){
    if(!container)return;container.querySelector('.poke-tags')?.remove();
    if(!p?.mega&&!isLegendary(p))return;
    const tags=document.createElement('div');tags.className='poke-tags';if(p.mega)tags.appendChild(badge('mega'));if(isLegendary(p))tags.appendChild(badge('legendary'));container.appendChild(tags);
  }
  function usedForSlot(ti,pi){
    const used=usedAcrossTeams(ti);(currentTeams[ti]||[]).forEach((p,i)=>{if(i!==pi&&p)used.add(p.id)});return used;
  }
  function rerollOneV19(ti,pi){
    if(!pokemon.length)return;
    const c=cfg(),pool=poolFor(c),used=usedForSlot(ti,pi),team=currentTeams[ti]||[],anotherMega=team.some((p,i)=>i!==pi&&p?.mega);
    let replacement=null;
    if(document.getElementById('megas')?.checked&&!anotherMega&&Math.random()<.18){
      const allMegas=[
        [3,'Mega Venusaur'],[6,'Mega Charizard X'],[6,'Mega Charizard Y'],[9,'Mega Blastoise'],[15,'Mega Beedrill'],[18,'Mega Pidgeot'],[65,'Mega Alakazam'],[80,'Mega Slowbro'],[94,'Mega Gengar'],[115,'Mega Kangaskhan'],[127,'Mega Pinsir'],[130,'Mega Gyarados'],[142,'Mega Aerodactyl'],[150,'Mega Mewtwo X'],[150,'Mega Mewtwo Y'],[181,'Mega Ampharos'],[208,'Mega Steelix'],[212,'Mega Scizor'],[214,'Mega Heracross'],[229,'Mega Houndoom'],[248,'Mega Tyranitar'],[254,'Mega Sceptile'],[257,'Mega Blaziken'],[260,'Mega Swampert'],[282,'Mega Gardevoir'],[302,'Mega Sableye'],[303,'Mega Mawile'],[306,'Mega Aggron'],[308,'Mega Medicham'],[310,'Mega Manectric'],[319,'Mega Sharpedo'],[323,'Mega Camerupt'],[334,'Mega Altaria'],[354,'Mega Banette'],[359,'Mega Absol'],[362,'Mega Glalie'],[373,'Mega Salamence'],[376,'Mega Metagross'],[380,'Mega Latias'],[381,'Mega Latios'],[428,'Mega Lopunny'],[445,'Mega Garchomp'],[448,'Mega Lucario'],[460,'Mega Abomasnow'],[475,'Mega Gallade'],[531,'Mega Audino'],[719,'Mega Diancie']
      ].filter(([id])=>(c.legendaries||!legendaryIds.has(id))&&(!c.unique||!used.has(id)));
      const m=rand(allMegas);if(m)replacement={id:m[0],name:baseNameFor({id:m[0]}),displayName:m[1],mega:true};
    }
    if(!replacement)replacement=pick(pool,used,c);
    currentTeams[ti][pi]=replacement;localStorage.setItem(TEAMS_KEY,JSON.stringify(currentTeams));renderTeams();renderVersus();
  }
  function rerollTeamV19(ti){
    if(!pokemon.length)return;currentTeams[ti]=window.makeTeamForPlayer(ti);localStorage.setItem(TEAMS_KEY,JSON.stringify(currentTeams));renderTeams(true);renderVersus();
  }

  window.renderTeams=function(reveal=false){
    teamsEl.innerHTML='';const c=cfg();
    currentTeams.slice(0,c.players).forEach((team,ti)=>{
      if(!team)return;const node=document.getElementById('teamTemplate').content.cloneNode(true),card=node.querySelector('.team-card');if(reveal)card.style.animationDelay=`${ti*90}ms`;
      node.querySelector('h2').textContent=`J${ti+1} · ${displayName(ti)}`;node.querySelector('.reroll-team').onclick=()=>rerollTeamV19(ti);
      const grid=node.querySelector('.pokemon-grid');team.forEach((p,pi)=>{if(!p)return;const pc=document.getElementById('pokemonTemplate').content.cloneNode(true),img=pc.querySelector('img');setPokemonImage(img,p);
        const cardEl=pc.querySelector('.pokemon-card');if(isLegendary(p))cardEl.classList.add('legendary-card');if(p.mega)cardEl.classList.add('mega-card-real');
        pc.querySelector('.name').textContent=p.displayName||String(p.name||'').replaceAll('-',' ');pc.querySelector('.meta').innerHTML=`<span class="dex">${dex(p.id)}</span><span>Nv. ${c.level}${c.perfectIv?' · IV31':''}</span>`;decorate(pc.querySelector('.pokemon-info'),p);pc.querySelector('.reroll-one').onclick=()=>rerollOneV19(ti,pi);grid.appendChild(pc)});
      teamsEl.appendChild(node);
    });
  };
  window.renderTeamWheelPreview=function(ids=fallbackPreviewIds,showDex=false){
    teamSpriteLayer.innerHTML='';const clean=(ids||[]).filter(Boolean).slice(0,6);while(clean.length<6)clean.push(fallbackPreviewIds[clean.length%fallbackPreviewIds.length]);
    let exactTeam=null;if(showDex){exactTeam=currentTeams.find(t=>Array.isArray(t)&&t.length===clean.length&&t.every((p,i)=>p&&p.id===clean[i]))||null;}
    clean.forEach((id,i)=>{const angle=(-90+i*60)*Math.PI/180,wrap=document.createElement('div');wrap.className='team-sprite-wrap v10-slot';wrap.style.left=`${50+Math.cos(angle)*31}%`;wrap.style.top=`${50+Math.sin(angle)*31}%`;
      const p=exactTeam?.[i]||{id,name:pokemon.find(x=>x.id===id)?.name||''};const img=document.createElement('img');img.className='team-sprite';setPokemonImage(img,p);wrap.appendChild(img);
      if(showDex){const d=document.createElement('span');d.className='dex-badge';d.textContent=dex(id);wrap.appendChild(d)}if(showDex&&(p.mega||isLegendary(p))){const stack=document.createElement('span');stack.className='wheel-rarity-stack';if(p.mega)stack.appendChild(badge('mega'));if(isLegendary(p))stack.appendChild(badge('legendary'));wrap.appendChild(stack)}teamSpriteLayer.appendChild(wrap)});
  };

  if(currentTeams.length)renderTeams(false);
  const last=currentTeams[Math.min(Math.max(draftIndex-1,0),currentTeams.length-1)];if(last?.length)renderTeamWheelPreview(last.map(p=>p.id),true);
})();
