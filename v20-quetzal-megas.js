/* V20 — Quetzal dex alignment + strict Mega-form rendering */
(function(){
  const MEGA_FORMS={
    3:{name:'Mega Venusaur',slug:'venusaur-mega'},
    6:[{name:'Mega Charizard X',slug:'charizard-megax'},{name:'Mega Charizard Y',slug:'charizard-megay'}],
    9:{name:'Mega Blastoise',slug:'blastoise-mega'},15:{name:'Mega Beedrill',slug:'beedrill-mega'},18:{name:'Mega Pidgeot',slug:'pidgeot-mega'},
    65:{name:'Mega Alakazam',slug:'alakazam-mega'},80:{name:'Mega Slowbro',slug:'slowbro-mega'},94:{name:'Mega Gengar',slug:'gengar-mega'},115:{name:'Mega Kangaskhan',slug:'kangaskhan-mega'},127:{name:'Mega Pinsir',slug:'pinsir-mega'},130:{name:'Mega Gyarados',slug:'gyarados-mega'},142:{name:'Mega Aerodactyl',slug:'aerodactyl-mega'},
    150:[{name:'Mega Mewtwo X',slug:'mewtwo-megax'},{name:'Mega Mewtwo Y',slug:'mewtwo-megay'}],181:{name:'Mega Ampharos',slug:'ampharos-mega'},208:{name:'Mega Steelix',slug:'steelix-mega'},212:{name:'Mega Scizor',slug:'scizor-mega'},214:{name:'Mega Heracross',slug:'heracross-mega'},229:{name:'Mega Houndoom',slug:'houndoom-mega'},248:{name:'Mega Tyranitar',slug:'tyranitar-mega'},254:{name:'Mega Sceptile',slug:'sceptile-mega'},257:{name:'Mega Blaziken',slug:'blaziken-mega'},260:{name:'Mega Swampert',slug:'swampert-mega'},282:{name:'Mega Gardevoir',slug:'gardevoir-mega'},302:{name:'Mega Sableye',slug:'sableye-mega'},303:{name:'Mega Mawile',slug:'mawile-mega'},306:{name:'Mega Aggron',slug:'aggron-mega'},308:{name:'Mega Medicham',slug:'medicham-mega'},310:{name:'Mega Manectric',slug:'manectric-mega'},319:{name:'Mega Sharpedo',slug:'sharpedo-mega'},323:{name:'Mega Camerupt',slug:'camerupt-mega'},334:{name:'Mega Altaria',slug:'altaria-mega'},354:{name:'Mega Banette',slug:'banette-mega'},359:{name:'Mega Absol',slug:'absol-mega'},362:{name:'Mega Glalie',slug:'glalie-mega'},373:{name:'Mega Salamence',slug:'salamence-mega'},376:{name:'Mega Metagross',slug:'metagross-mega'},380:{name:'Mega Latias',slug:'latias-mega'},381:{name:'Mega Latios',slug:'latios-mega'},384:{name:'Mega Rayquaza',slug:'rayquaza-mega'},428:{name:'Mega Lopunny',slug:'lopunny-mega'},445:{name:'Mega Garchomp',slug:'garchomp-mega'},448:{name:'Mega Lucario',slug:'lucario-mega'},460:{name:'Mega Abomasnow',slug:'abomasnow-mega'},475:{name:'Mega Gallade',slug:'gallade-mega'},531:{name:'Mega Audino',slug:'audino-mega'},719:{name:'Mega Diancie',slug:'diancie-mega'}
  };
  const LEGENDARY_EXTRA=new Set([793,794,795,796,797,798,799,803,804,805,806]);
  function isLegendaryQ(p){const id=Number(p?.id);return legendaryIds.has(id)||LEGENDARY_EXTRA.has(id)}
  function quetzalDex(p){return `#${String(Number(p?.id||0)).padStart(4,'0')}`}
  window.dex=function(id){return `#${String(Number(id||0)).padStart(4,'0')}`};
  function megaSpecFor(p){
    if(!p?.mega)return null;const entry=MEGA_FORMS[Number(p.id)];if(!entry)return null;if(!Array.isArray(entry))return entry;
    const dn=String(p.displayName||'').toLowerCase();return entry.find(x=>dn.includes(x.name.toLowerCase().replace('mega ','')))||entry.find(x=>x.name.toLowerCase()===dn)||entry[0];
  }
  function megaSources(slug){return [
    `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`,
    `https://play.pokemonshowdown.com/sprites/gen5/${slug}.png`,
    `https://play.pokemonshowdown.com/sprites/gen5ani/${slug}.gif`
  ]}
  function strictMegaImage(img,p){
    const spec=megaSpecFor(p);if(!spec)return false;
    img.dataset.v20Mega='1';img.dataset.megaSlug=spec.slug;img.alt=spec.name;img.style.visibility='visible';
    let i=0,srcs=megaSources(spec.slug);img.onerror=()=>{i++;if(i<srcs.length)img.src=srcs[i];else{img.style.visibility='hidden';img.onerror=null}};img.src=srcs[0];return true;
  }
  function normalImage(img,p){
    const id=Number(p.id),name=(pokemon.find(x=>x.id===id)?.name||p.name||'').toLowerCase();const srcs=[
      `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/home/${id}.png`,
      `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${id}.png`,
      `https://play.pokemonshowdown.com/sprites/gen5/${name}.png`
    ];let i=0;img.dataset.v20Mega='0';img.style.visibility='visible';img.onerror=()=>{i++;if(i<srcs.length)img.src=srcs[i];else img.style.visibility='hidden'};img.src=srcs[0];
  }
  function badge(type){const s=document.createElement('span');s.className=`poke-badge ${type}`;s.textContent=type==='mega'?'✦ MEGA':'★ LEGENDARIO';return s}
  function tags(container,p){container.querySelector('.poke-tags')?.remove();if(!p?.mega&&!isLegendaryQ(p))return;const t=document.createElement('div');t.className='poke-tags';if(p.mega)t.appendChild(badge('mega'));if(isLegendaryQ(p))t.appendChild(badge('legendary'));container.appendChild(t)}
  function rerollOneV20(ti,pi){
    if(!pokemon.length)return;const c=cfg(),pool=poolFor(c),used=usedAcrossTeams(ti),team=currentTeams[ti]||[];team.forEach((p,i)=>{if(i!==pi&&p)used.add(p.id)});const anotherMega=team.some((p,i)=>i!==pi&&p?.mega);let replacement=null;
    if(document.getElementById('megas')?.checked&&!anotherMega&&Math.random()<.18){const candidates=[];Object.entries(MEGA_FORMS).forEach(([id,entry])=>{const n=Number(id);if((c.legendaries||!isLegendaryQ({id:n}))&&(!c.unique||!used.has(n))){(Array.isArray(entry)?entry:[entry]).forEach(e=>candidates.push({id:n,name:pokemon.find(x=>x.id===n)?.name||'',displayName:e.name,mega:true,megaSlug:e.slug}))}});replacement=rand(candidates)}
    if(!replacement)replacement=pick(pool,used,c);currentTeams[ti][pi]=replacement;localStorage.setItem(TEAMS_KEY,JSON.stringify(currentTeams));renderTeams();renderVersus();
  }
  window.makeTeamForPlayer=function(playerIndex){
    const c=cfg(),pool=poolFor(c),used=usedAcrossTeams(playerIndex),team=[];const megaOn=document.getElementById('megas')?.checked;const megaChance=megaOn&&(Math.random()<(c.mode==='chaos'?.42:.35));
    if(megaChance){const candidates=[];Object.entries(MEGA_FORMS).forEach(([id,entry])=>{const n=Number(id);if((c.legendaries||!isLegendaryQ({id:n}))&&(!c.unique||!used.has(n))){(Array.isArray(entry)?entry:[entry]).forEach(e=>candidates.push({id:n,name:pokemon.find(x=>x.id===n)?.name||'',displayName:e.name,mega:true,megaSlug:e.slug}))}});const m=rand(candidates);if(m){team.push(m);if(c.unique)used.add(m.id)}}
    while(team.length<c.teamSize){const i=team.length,target=c.mode==='balanced'?(i<Math.ceil(c.teamSize/2)?'strong':'normal'):'any',p=pick(pool,used,c,target);if(!p)break;team.push({...p})}for(let i=team.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[team[i],team[j]]=[team[j],team[i]]}return team;
  };
  window.renderTeams=function(reveal=false){teamsEl.innerHTML='';const c=cfg();currentTeams.slice(0,c.players).forEach((team,ti)=>{if(!team)return;const node=document.getElementById('teamTemplate').content.cloneNode(true),card=node.querySelector('.team-card');if(reveal)card.style.animationDelay=`${ti*90}ms`;node.querySelector('h2').textContent=`J${ti+1} · ${displayName(ti)}`;node.querySelector('.reroll-team').onclick=()=>{currentTeams[ti]=window.makeTeamForPlayer(ti);localStorage.setItem(TEAMS_KEY,JSON.stringify(currentTeams));renderTeams(true);renderVersus()};const grid=node.querySelector('.pokemon-grid');team.forEach((p,pi)=>{if(!p)return;const pc=document.getElementById('pokemonTemplate').content.cloneNode(true),img=pc.querySelector('img');if(!strictMegaImage(img,p))normalImage(img,p);const cardEl=pc.querySelector('.pokemon-card');if(isLegendaryQ(p))cardEl.classList.add('legendary-card');if(p.mega)cardEl.classList.add('mega-card-real');pc.querySelector('.name').textContent=p.displayName||String(p.name||'').replaceAll('-',' ');pc.querySelector('.meta').innerHTML=`<span class="dex">${quetzalDex(p)}</span><span>Nv. ${c.level}${c.perfectIv?' · IV31':''}</span>`;tags(pc.querySelector('.pokemon-info'),p);pc.querySelector('.reroll-one').onclick=()=>rerollOneV20(ti,pi);grid.appendChild(pc)});teamsEl.appendChild(node)})};
  window.renderTeamWheelPreview=function(ids=fallbackPreviewIds,showDex=false){teamSpriteLayer.innerHTML='';const clean=(ids||[]).filter(Boolean).slice(0,6);while(clean.length<6)clean.push(fallbackPreviewIds[clean.length%fallbackPreviewIds.length]);let exactTeam=null;if(showDex)exactTeam=currentTeams.find(t=>Array.isArray(t)&&t.length===clean.length&&t.every((p,i)=>p&&p.id===clean[i]))||null;clean.forEach((id,i)=>{const angle=(-90+i*60)*Math.PI/180,wrap=document.createElement('div');wrap.className='team-sprite-wrap v10-slot';wrap.style.left=`${50+Math.cos(angle)*31}%`;wrap.style.top=`${50+Math.sin(angle)*31}%`;const p=exactTeam?.[i]||{id,name:pokemon.find(x=>x.id===id)?.name||''};const img=document.createElement('img');img.className='team-sprite';if(!strictMegaImage(img,p))normalImage(img,p);wrap.appendChild(img);if(showDex){const d=document.createElement('span');d.className='dex-badge';d.textContent=quetzalDex(p);wrap.appendChild(d)}if(showDex&&(p.mega||isLegendaryQ(p))){const s=document.createElement('span');s.className='wheel-rarity-stack';if(p.mega)s.appendChild(badge('mega'));if(isLegendaryQ(p))s.appendChild(badge('legendary'));wrap.appendChild(s)}teamSpriteLayer.appendChild(wrap)})};
  /* migrate stale mega objects so their exact form/slugs are deterministic */
  currentTeams=currentTeams.map(team=>(team||[]).map(p=>{if(!p?.mega)return p;const spec=megaSpecFor(p);return spec?{...p,displayName:spec.name,megaSlug:spec.slug}:p}));localStorage.setItem(TEAMS_KEY,JSON.stringify(currentTeams));
  if(currentTeams.length)renderTeams(false);const last=currentTeams[Math.min(Math.max(draftIndex-1,0),currentTeams.length-1)];if(last?.length)renderTeamWheelPreview(last.map(p=>p.id),true);
})();
