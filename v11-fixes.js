/* V11 — enforce mobile-safe player grid and Pokemon trainer sprites */
(function(){
  const trainerSprites=['red','leaf','ethan','lyra','brendan','may','lucas','dawn','hilbert','hilda','nate','rosa','calem','serena','elio','selene','victor','gloria','blue','misty','brock','cynthia','steven','lance'];
  function hashSeed(seed){let h=0;const s=String(seed||'trainer');for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return Math.abs(h)}
  function showdownTrainer(seed){const name=trainerSprites[hashSeed(seed)%trainerSprites.length];return `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`}

  function hardFixPlayerDock(){
    const dock=document.getElementById('teamRouletteNames');if(!dock)return;
    const imp=(p,v)=>dock.style.setProperty(p,v,'important');
    imp('position','relative');imp('left','auto');imp('right','auto');imp('top','auto');imp('bottom','auto');imp('transform','none');
    imp('width','calc(100% - 16px)');imp('max-width','none');imp('min-width','0');imp('margin','16px 8px 0');imp('padding','0');
    imp('display','grid');imp('grid-template-columns','repeat(2,minmax(0,1fr))');imp('gap','8px');imp('box-sizing','border-box');imp('overflow','hidden');
    [...dock.children].forEach(ch=>{
      ch.style.setProperty('position','relative','important');ch.style.setProperty('left','auto','important');ch.style.setProperty('right','auto','important');
      ch.style.setProperty('transform','none','important');ch.style.setProperty('width','100%','important');ch.style.setProperty('max-width','100%','important');
      ch.style.setProperty('min-width','0','important');ch.style.setProperty('margin','0','important');ch.style.setProperty('box-sizing','border-box','important');
      ch.style.setProperty('overflow','hidden','important');ch.style.setProperty('text-overflow','ellipsis','important');ch.style.setProperty('white-space','nowrap','important');
    });
  }

  function replaceGenericTrainers(root=document){
    const imgs=root.querySelectorAll?.('.trainer-avatar,.fighter-trainer,.v10-trainer')||[];
    imgs.forEach((img,i)=>{
      if(img.dataset.v11Trainer==='1')return;
      const key=`${img.alt||'trainer'}-${i}-${img.closest('.battle-fighter,.v10-fighter,.battle-side')?.textContent||''}`;
      img.src=showdownTrainer(key);
      img.dataset.v11Trainer='1';
      img.alt='Entrenador Pokémon';
    });
  }

  /* Any old renderer may repaint the VS card, so repair it immediately after DOM changes. */
  const observer=new MutationObserver(muts=>{
    let touchDock=false,touchBattle=false;
    muts.forEach(m=>{if(m.target?.id==='teamRouletteNames'||m.target?.closest?.('#teamRouletteNames'))touchDock=true;if(m.target?.id==='versusResult'||m.target?.closest?.('#versusResult'))touchBattle=true});
    if(touchDock)hardFixPlayerDock();
    if(touchBattle)replaceGenericTrainers(document.getElementById('versusResult')||document);
  });
  observer.observe(document.body,{childList:true,subtree:true});

  /* Hide the textual combination list even if an older script repaints it. */
  const combos=document.getElementById('rouletteOptions');if(combos)combos.style.setProperty('display','none','important');
  hardFixPlayerDock();replaceGenericTrainers();
  window.addEventListener('resize',hardFixPlayerDock,{passive:true});
  setTimeout(()=>{hardFixPlayerDock();replaceGenericTrainers()},250);

  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw-v11.js');
})();
