/* V28 — la ruleta muestra exactamente tantos Pokémon como indique la configuración */
(function(){
  function wheelCount(){
    const n=Number(document.getElementById('teamSize')?.value||6);
    return n===3?3:6;
  }

  function renderSizedTeamWheel(ids=fallbackPreviewIds,showDex=false){
    const count=wheelCount();
    const source=(ids||[]).filter(Boolean).slice(0,count);
    if(!source.length)return;
    teamSpriteLayer.innerHTML='';
    source.forEach((id,i)=>{
      const angle=(-90+i*(360/source.length))*Math.PI/180;
      const wrap=document.createElement('div');
      wrap.className='team-sprite-wrap v28-slot';
      wrap.style.left=`${50+Math.cos(angle)*31}%`;
      wrap.style.top=`${50+Math.sin(angle)*31}%`;
      const p=(showDex?currentTeams.find(t=>Array.isArray(t)&&t.length===source.length&&t.every((x,j)=>x&&x.id===source[j]))?.[i]:null)||{id,name:pokemon.find(x=>x.id===id)?.name||''};
      const img=document.createElement('img');
      img.className='team-sprite';
      if(typeof setPokemonImage==='function')setPokemonImage(img,p);else img.src=spriteUrl(id);
      img.alt=p.displayName||p.name||'';
      wrap.appendChild(img);
      if(showDex){
        const d=document.createElement('span');d.className='dex-badge';d.textContent=dex(id);wrap.appendChild(d);
        if(p.mega||isLegendary(p)){
          const stack=document.createElement('span');stack.className='wheel-rarity-stack';
          if(p.mega)stack.appendChild(badge('mega'));
          if(isLegendary(p))stack.appendChild(badge('legendary'));
          wrap.appendChild(stack);
        }
      }
      teamSpriteLayer.appendChild(wrap);
    });
  }

  window.renderTeamWheelPreview=renderSizedTeamWheel;

  const teamSize=document.getElementById('teamSize');
  if(teamSize)teamSize.addEventListener('change',()=>{
    const current=[...teamSpriteLayer.querySelectorAll('.team-sprite-wrap')].map(w=>Number(w.querySelector('.dex-badge')?.textContent?.replace(/\D/g,''))).filter(Boolean);
    renderSizedTeamWheel(current.length?current:(typeof randomPreviewIds==='function'?randomPreviewIds():fallbackPreviewIds),!!current.length);
  });

  const oldReset=window.resetDraft;
  if(typeof oldReset==='function')window.resetDraft=function(clearTeams=true){const r=oldReset(clearTeams);return r};

  if(typeof pokemon!=='undefined'&&pokemon.length){
    const existing=[...teamSpriteLayer.querySelectorAll('.dex-badge')].map(x=>Number(String(x.textContent).replace(/\D/g,''))).filter(Boolean);
    renderSizedTeamWheel(existing.length?existing:(typeof randomPreviewIds==='function'?randomPreviewIds():fallbackPreviewIds),!!existing.length);
  }
})();
