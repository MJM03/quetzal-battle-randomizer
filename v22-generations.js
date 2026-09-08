(function(){
  const GEN_KEY='qbr-generation-filter-v1';
  const GENERATIONS=[
    {value:'all',label:'Todas las generaciones'},
    {value:'1',label:'Gen I · Kanto',min:1,max:151},
    {value:'2',label:'Gen II · Johto',min:152,max:251},
    {value:'3',label:'Gen III · Hoenn',min:252,max:386},
    {value:'4',label:'Gen IV · Sinnoh',min:387,max:493},
    {value:'5',label:'Gen V · Teselia',min:494,max:649},
    {value:'6',label:'Gen VI · Kalos',min:650,max:721},
    {value:'7',label:'Gen VII · Alola',min:722,max:809},
    {value:'8',label:'Gen VIII · Galar',min:810,max:905},
    {value:'9',label:'Gen IX · Paldea',min:906,max:1025}
  ];
  function getGen(id){const n=Number(id);return GENERATIONS.slice(1).find(g=>n>=g.min&&n<=g.max)||GENERATIONS[0]}
  function getSelected(){return document.querySelector('#generationFilter')?.value||'all'}
  function setStatus(text){const el=document.querySelector('#status');if(el)el.textContent=text}
  function save(){localStorage.setItem(GEN_KEY,getSelected())}
  function applyFilter(announce=true){
    if(typeof pokemon==='undefined')return;
    const all=window.__qbrAllPokemon||(Array.isArray(pokemon)?pokemon.slice():[]);
    if(!all.length)return;
    window.__qbrAllPokemon=all;
    const selected=getSelected(),gen=GENERATIONS.find(g=>g.value===selected);
    pokemon=selected==='all'?all.slice():all.filter(p=>p.id>=gen.min&&p.id<=gen.max);
    if(announce)setStatus(selected==='all'?'Pokédex completa · Gen I–IX':`${gen.label} · ${pokemon.length} Pokémon disponibles`);
    if(typeof renderTeamWheelPreview==='function')renderTeamWheelPreview(randomPreviewIds());
    if(typeof renderDraftState==='function')renderDraftState();
  }
  function addGenerationBadge(card,p){
    if(!card||!p||card.querySelector('.generation-badge'))return;
    const name=card.querySelector('.name');if(!name)return;
    const badge=document.createElement('span');badge.className='generation-badge';badge.textContent=`GEN ${getGen(p.id).value.toUpperCase()}`;name.insertAdjacentElement('afterend',badge);
  }
  function decorateTeams(){
    document.querySelectorAll('#teams .pokemon-card').forEach(card=>{
      const dexEl=card.querySelector('.dex');if(!dexEl)return;
      const id=Number(dexEl.textContent.replace(/\D/g,''));if(!id)return;
      addGenerationBadge(card,{id});
    });
  }
  function buildControl(){
    const anchor=document.querySelector('.player-names-wrap');if(!anchor||document.querySelector('#generationFilter'))return;
    const wrap=document.createElement('div');wrap.className='generation-filter-wrap';
    wrap.innerHTML=`<span class="micro-label">Generación de Pokémon</span><label class="generation-select-label"><span>Elegir generación</span><select id="generationFilter" aria-label="Filtrar Pokémon por generación"></select></label><p class="generation-help">El sorteo usará únicamente Pokémon de la generación elegida. Las megas, legendarios y otras formas conservan la generación de su Pokémon base.</p>`;
    anchor.insertAdjacentElement('afterend',wrap);
    const select=wrap.querySelector('select');GENERATIONS.forEach(g=>{const o=document.createElement('option');o.value=g.value;o.textContent=g.label;select.appendChild(o)});
    select.value=localStorage.getItem(GEN_KEY)||'all';
    select.addEventListener('change',()=>{save();if(typeof resetDraft==='function')resetDraft(true);applyFilter(true);if(typeof renderRoulette==='function')renderRoulette();if(typeof renderVersus==='function')renderVersus()});
  }
  function decorateAfterRender(){decorateTeams();const selected=getSelected();document.querySelectorAll('.pokemon-card').forEach(card=>card.classList.toggle('generation-filtered',selected!=='all'))}
  buildControl();
  const observer=new MutationObserver(()=>decorateAfterRender());
  const teams=document.querySelector('#teams');if(teams)observer.observe(teams,{childList:true,subtree:true});
  let tries=0;const wait=setInterval(()=>{tries++;if(typeof pokemon!=='undefined'&&Array.isArray(pokemon)&&pokemon.length){if(!window.__qbrAllPokemon)window.__qbrAllPokemon=pokemon.slice();const saved=localStorage.getItem(GEN_KEY)||'all',select=document.querySelector('#generationFilter');if(select)select.value=saved;applyFilter(false);decorateAfterRender();clearInterval(wait)}if(tries>100)clearInterval(wait)},100);
})();
