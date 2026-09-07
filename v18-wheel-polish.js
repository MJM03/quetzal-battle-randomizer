/* V18 — legendary badge reliability on wheel + VS wheel reset polish */
(function(){
  function rarityBadge(type){
    const s=document.createElement('span');
    s.className=`poke-badge ${type}`;
    s.textContent=type==='mega'?'✦ MEGA':'★ LEGENDARIO';
    return s;
  }
  function findExactPokemon(id,index,ids){
    const matches=currentTeams.filter(t=>Array.isArray(t)&&t.length>=ids.length&&ids.every((x,i)=>t[i]?.id===x));
    const team=matches[0];
    return team?.[index]||{id,name:pokemon.find(x=>x.id===id)?.name||''};
  }
  const previousRenderTeamWheel=window.renderTeamWheelPreview;
  window.renderTeamWheelPreview=function(ids=fallbackPreviewIds,showDex=false){
    const clean=(ids||[]).filter(Boolean).slice(0,6);
    while(clean.length<6)clean.push(fallbackPreviewIds[clean.length%fallbackPreviewIds.length]);
    if(typeof previousRenderTeamWheel==='function') previousRenderTeamWheel(clean,showDex);
    const slots=[...teamSpriteLayer.children];
    slots.slice(0,6).forEach((slot,i)=>{
      const id=Number(clean[i]);
      slot.querySelectorAll('.wheel-rarity-stack').forEach(n=>n.remove());
      const p=findExactPokemon(id,i,clean);
      const legendary=legendaryIds.has(id);
      const mega=!!p?.mega;
      if(!legendary&&!mega)return;
      const stack=document.createElement('span');stack.className='wheel-rarity-stack';
      if(mega)stack.appendChild(rarityBadge('mega'));
      if(legendary)stack.appendChild(rarityBadge('legendary'));
      slot.appendChild(stack);
    });
  };

  /* Repair the wheel currently visible after loading this patch. */
  const visibleIds=[...teamSpriteLayer.querySelectorAll('.dex-badge')].map(x=>Number(String(x.textContent).replace(/\D/g,''))).filter(Boolean);
  if(visibleIds.length)window.renderTeamWheelPreview(visibleIds,true);

  /* Keep the VS wheel perfectly front-facing before/after spins. */
  const vsBtn=document.getElementById('versusBtn');
  const wheel=document.getElementById('rouletteWheel');
  if(wheel){
    const normalize=()=>{
      const tilt=wheel.closest('.wheel-tilt');
      if(tilt){tilt.style.setProperty('transform','none','important');tilt.style.setProperty('transform-style','flat','important');}
      wheel.style.borderRadius='50%';wheel.style.aspectRatio='1 / 1';
    };
    normalize();
    window.addEventListener('resize',normalize,{passive:true});
    if(vsBtn)vsBtn.addEventListener('click',()=>{normalize();setTimeout(normalize,3600)},true);
  }
})();
