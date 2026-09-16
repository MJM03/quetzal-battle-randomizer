(function(){
  const KEY='qbr-generation-combo-v1';
  const GENS=[
    {id:1,label:'Gen I · Kanto',min:1,max:151},
    {id:2,label:'Gen II · Johto',min:152,max:251},
    {id:3,label:'Gen III · Hoenn',min:252,max:386},
    {id:4,label:'Gen IV · Sinnoh',min:387,max:493},
    {id:5,label:'Gen V · Teselia',min:494,max:649},
    {id:6,label:'Gen VI · Kalos',min:650,max:721},
    {id:7,label:'Gen VII · Alola',min:722,max:809},
    {id:8,label:'Gen VIII · Galar',min:810,max:905},
    {id:9,label:'Gen IX · Paldea',min:906,max:1025}
  ];
  const ALL='all';
  const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)&&x.length?x.map(Number).filter(n=>n>=1&&n<=9):[ALL]}catch(e){return[ALL]}};
  let selected=load();
  function save(){localStorage.setItem(KEY,JSON.stringify(selected));}
  function setStatus(text){const el=document.querySelector('#status');if(el)el.textContent=text;}
  function selectedLabel(){
    if(selected.includes(ALL)||selected.length===9)return 'Todas las generaciones';
    return selected.sort((a,b)=>a-b).map(n=>'Gen '+['I','II','III','IV','V','VI','VII','VIII','IX'][n-1]).join(' + ');
  }
  function apply(){
    if(typeof pokemon==='undefined')return;
    const all=window.__qbrAllPokemon||(Array.isArray(pokemon)?pokemon.slice():[]);
    if(!all.length)return;
    window.__qbrAllPokemon=all;
    if(selected.includes(ALL)||selected.length===9) pokemon=all.slice();
    else pokemon=all.filter(p=>selected.includes(GENS.find(g=>p.id>=g.min&&p.id<=g.max)?.id));
    setStatus(selected.includes(ALL)||selected.length===9?'Pokédex completa · Gen I–IX':`${selectedLabel()} · ${pokemon.length} Pokémon disponibles`);
    if(typeof renderTeamWheelPreview==='function'&&typeof randomPreviewIds==='function')renderTeamWheelPreview(randomPreviewIds());
    if(typeof renderDraftState==='function')renderDraftState();
    if(typeof renderRoulette==='function')renderRoulette();
    if(typeof renderVersus==='function')renderVersus();
  }
  function build(){
    const old=document.querySelector('.generation-filter-wrap');
    if(!old)return;
    old.outerHTML=`<div class="generation-filter-wrap generation-combo-wrap">
      <span class="micro-label">Generación de Pokémon</span>
      <div class="generation-combo-head"><strong>Elegir generaciones</strong><button type="button" id="generationAllBtn" class="generation-all-btn">Todas</button></div>
      <div id="generationChecks" class="generation-checks"></div>
      <p class="generation-help">Puedes combinar cualquier generación. Por ejemplo: Gen I + Gen II + Gen IX. El sorteo usará únicamente esas generaciones.</p>
    </div>`;
    const box=document.querySelector('#generationChecks');
    GENS.forEach(g=>{
      const label=document.createElement('label');label.className='generation-check';
      label.innerHTML=`<input type="checkbox" value="${g.id}"><span class="check-box">✓</span><span class="gen-copy"><b>GEN ${g.id}</b><small>${g.label.replace(/^Gen [IVX]+ · /,'')}</small></span>`;
      const input=label.querySelector('input');input.checked=selected.includes(ALL)||selected.includes(g.id);
      input.addEventListener('change',()=>{
        const ids=[...box.querySelectorAll('input:checked')].map(x=>Number(x.value));
        selected=ids.length===0?[ALL]:ids;
        if(ids.length===9)selected=[ALL];
        save();
        if(typeof resetDraft==='function')resetDraft(true);
        apply();
      });
      box.appendChild(label);
    });
    document.querySelector('#generationAllBtn').addEventListener('click',()=>{
      selected=[ALL];save();
      box.querySelectorAll('input').forEach(i=>i.checked=true);
      if(typeof resetDraft==='function')resetDraft(true);
      apply();
    });
  }
  build();
  let tries=0;
  const wait=setInterval(()=>{
    tries++;
    if(typeof pokemon!=='undefined'&&Array.isArray(pokemon)&&pokemon.length){
      if(!window.__qbrAllPokemon)window.__qbrAllPokemon=pokemon.slice();
      apply();clearInterval(wait);
    }
    if(tries>100)clearInterval(wait);
  },100);
})();
