/* V31 — ruleta estable: un solo render, 3 o 6 sprites y mismo equipo de alineación */
(function(){
  function boot(){
    const layer=document.getElementById('teamSpriteLayer');
    const sizeEl=document.getElementById('teamSize');
    if(!layer||!sizeEl)return;
    const TEAMS_KEY='qbr-teams-v7',DRAFT_KEY='qbr-draft-index-v7';
    let lastKey='';
    let painting=false;

    const count=()=>Number(sizeEl.value)===3?3:6;
    function teams(){try{return JSON.parse(localStorage.getItem(TEAMS_KEY)||'[]')}catch{return []}}
    function activeTeam(){
      const all=teams();
      const draft=Number(localStorage.getItem(DRAFT_KEY)||0);
      // Tras guardar un jugador, draft apunta al siguiente; antes de terminar usamos el último equipo guardado.
      if(draft>0 && Array.isArray(all[draft-1]))return all[draft-1];
      for(let i=all.length-1;i>=0;i--)if(Array.isArray(all[i])&&all[i].length)return all[i];
      return [];
    }
    function clear(){while(layer.firstChild)layer.removeChild(layer.firstChild)}
    function draw(team,force){
      const n=count();
      const ids=(team||[]).map(p=>p&&p.id).filter(Number.isInteger).slice(0,n);
      const key=JSON.stringify([n,ids]);
      if(!force&&key===lastKey)return;
      lastKey=key;
      if(!ids.length){clear();return}
      // No llamamos a ningún renderer anterior: evita la superposición V28/V29/V30.
      clear();
      ids.forEach((id,i)=>{
        const angle=(-90+i*(360/ids.length))*Math.PI/180;
        const wrap=document.createElement('div');
        wrap.className='team-sprite-wrap v31-slot';
        wrap.style.left=`${50+Math.cos(angle)*31}%`;
        wrap.style.top=`${50+Math.sin(angle)*31}%`;
        const img=document.createElement('img');
        img.className='team-sprite';
        img.alt='';
        const p=(team||[]).find(x=>x&&x.id===id)||{};
        if(typeof window.setPokemonImage==='function')window.setPokemonImage(img,p);else img.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
        wrap.appendChild(img);
        if(typeof window.dex==='function'){
          const badge=document.createElement('span');badge.className='dex-badge';badge.textContent=window.dex(id);wrap.appendChild(badge);
        }
        layer.appendChild(wrap);
      });
    }
    function sync(force=false){draw(activeTeam(),force)}
    sizeEl.addEventListener('change',()=>{lastKey='';sync(true)});
    window.addEventListener('storage',e=>{if(e.key===TEAMS_KEY||e.key===DRAFT_KEY){lastKey='';sync(true)}});
    // La app actualiza localStorage en la misma pestaña, por eso observamos el DOM y revisamos periódicamente.
    const observer=new MutationObserver(()=>{if(!painting)sync(false)});
    observer.observe(layer,{childList:true,subtree:true});
    setInterval(()=>sync(false),150);
    sync(true);
    window.QBRWheelSync={refresh:()=>{lastKey='';sync(true)}};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
