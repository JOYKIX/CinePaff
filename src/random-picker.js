import {validateRandomCriteria} from './random-catalog.js?v=20260911-filters';

const icon=name=>{const el=document.createElement('span');el.className='material-symbols-rounded';el.setAttribute('aria-hidden','true');el.textContent=name;return el;};
const button=(label,className='')=>{const el=document.createElement('button');el.type='button';el.className=className;el.textContent=label;return el;};
const normalize=value=>String(value).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();

export function createRandomPicker({id,host,searchNodes,loadFilters,kind,discover,onRandomMode,onChoose,canChoose,createArtwork,describe}) {
  const shell=document.createElement('div');shell.className='discovery-shell';shell.id=id;
  host.insertBefore(shell,searchNodes[0]);
  const tabs=document.createElement('div');tabs.className='discovery-modes';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',kind==='anime'?'Trouver un anime':'Trouver un film');
  const searchTab=button('Recherche'),randomTab=button('Au hasard');searchTab.prepend(icon('search'));randomTab.prepend(icon('casino'));
  const searchPanel=document.createElement('div');searchPanel.id=id+'-search';searchPanel.setAttribute('role','tabpanel');
  const panel=document.createElement('div');panel.id=id+'-random';panel.className='random-picker hidden';panel.setAttribute('role','tabpanel');
  for(const [tab,target,suffix] of [[searchTab,searchPanel,'search-tab'],[randomTab,panel,'random-tab']]){
    tab.id=id+'-'+suffix;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',target.id);target.setAttribute('aria-labelledby',tab.id);
  }
  tabs.append(searchTab,randomTab);shell.append(tabs,searchPanel,panel);searchPanel.append(...searchNodes);
  const metadata=document.createElement('div');metadata.className='random-metadata';
  const metadataStatus=document.createElement('span');metadataStatus.setAttribute('role','status');
  const retry=button('Réessayer','random-reset hidden');metadata.append(metadataStatus,retry);
  const details=document.createElement('details');details.className='random-filters';
  const summary=document.createElement('summary'),summaryLabel=document.createElement('span');summaryLabel.textContent='Sans filtre';summary.append(icon('tune'),summaryLabel,icon('expand_more'));
  const filterBody=document.createElement('div');filterBody.className='random-filters__body';
  const genreGroup=document.createElement('fieldset');genreGroup.className='random-genres';
  const legend=document.createElement('legend');legend.textContent='Genres';genreGroup.append(legend);
  const genreSearch=document.createElement('input');genreSearch.type='search';genreSearch.className='random-genre-search';genreSearch.id=id+'-genre-search';genreSearch.autocomplete='off';
  genreSearch.placeholder=kind==='anime'?'Rechercher un genre ou un thème':'Rechercher un genre';genreSearch.setAttribute('aria-label',genreSearch.placeholder);
  const genreChoices=document.createElement('div');genreChoices.className='random-genre-choices';
  const emptyGenres=document.createElement('small');emptyGenres.className='hidden';emptyGenres.textContent='Aucun genre trouvé.';emptyGenres.setAttribute('role','status');
  const hint=document.createElement('small');hint.id=id+'-genre-hint';genreGroup.setAttribute('aria-describedby',hint.id);
  genreGroup.append(genreSearch,genreChoices,emptyGenres,hint);
  const years=document.createElement('fieldset');years.className='random-years';
  const yearLegend=document.createElement('legend');yearLegend.textContent='Années';years.append(yearLegend);
  const inputs=['De','À'].map((label,index)=>{
    const field=document.createElement('label');field.textContent=label;
    const input=document.createElement('input');input.type='number';input.inputMode='numeric';input.min='1870';input.max=String(new Date().getFullYear()+5);input.step='1';input.placeholder='Toutes';input.id=id+(index?'-year-to':'-year-from');input.setAttribute('aria-label',index?'Année de fin':'Année de début');
    input.addEventListener('input',invalidate);field.append(input);years.append(field);return input;
  });
  const advanced=document.createElement('fieldset');advanced.className='random-advanced';
  const advancedLegend=document.createElement('legend');advancedLegend.textContent='Affiner';advanced.append(advancedLegend);
  const advancedGrid=document.createElement('div');advancedGrid.className='random-advanced-grid';advanced.append(advancedGrid);
  const reset=button('Réinitialiser','random-reset');reset.addEventListener('click',resetFilters);
  filterBody.append(genreGroup,years,advanced,reset);details.append(summary,filterBody);
  const stage=document.createElement('div');stage.className='random-result';stage.setAttribute('aria-live','polite');
  const status=document.createElement('p');status.className='random-status';status.setAttribute('role','status');
  const actions=document.createElement('div');actions.className='random-actions';
  const generateButton=button('','button button--quiet random-generate');generateButton.append(icon('casino'));
  const generateLabel=document.createElement('span');generateLabel.textContent='Surprends-moi';generateButton.append(generateLabel);
  const choose=button('Choisir','button button--primary hidden');choose.append(icon('arrow_forward'));actions.append(generateButton,choose);
  panel.append(metadata,details,stage,status,actions);
  let schema=null,loading=false,controller=null,requestId=0,result=null,enabled=true,busy=false,mode='search',recent=[];
  const selected=new Set(),fields=new Map();
  const criteria=()=>({genres:[...selected],yearFrom:inputs[0].value,yearTo:inputs[1].value,...Object.fromEntries([...fields].map(([key,input])=>[key,input.value]))});
  function syncControls(){
    generateButton.disabled=!enabled||busy||loading||!schema;choose.disabled=!enabled||busy;
    for(const fieldset of [genreGroup,years,advanced])fieldset.disabled=!enabled||mode!=='random'||!schema;
    generateLabel.textContent=loading?'Chargement…':busy?'Recherche…':result?'Une autre':'Surprends-moi';
  }
  function cancel(){requestId++;controller?.abort();controller=null;busy=false;panel.removeAttribute('aria-busy');syncControls();}
  function updateGenreSearch(){
    const query=normalize(genreSearch.value);let visible=0;
    for(const item of genreChoices.children){
      const show=selected.has(item.dataset.genre)||!query||normalize(item.textContent+' '+item.dataset.genre).includes(query);
      item.classList.toggle('hidden',!show);if(show)visible++;
    }
    emptyGenres.classList.toggle('hidden',visible>0);
  }
  function invalidate(){
    cancel();result=null;recent=[];stage.replaceChildren();choose.classList.add('hidden');status.textContent='';
    const value=criteria();
    const count=selected.size+Number(Boolean(value.yearFrom||value.yearTo))+(schema?.fields||[]).filter(field=>value[field.key]!==''&&value[field.key]!==String(field.default??'')).length;
    summaryLabel.textContent=count?count+' filtre'+(count>1?'s':''):'Sans filtre';
    hint.textContent=value.genreMode==='all'?'Tous les genres et thèmes choisis.':'Au moins un des genres ou thèmes choisis.';
    if(kind==='film')hint.textContent=value.genreMode==='all'?'Tous les genres choisis.':'Au moins un des genres choisis.';
    reset.classList.toggle('hidden',!count&&!genreSearch.value);syncControls();
  }
  function resetFilters(){
    selected.clear();genreChoices.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed','false'));
    inputs.forEach(el=>el.value='');for(const field of schema?.fields||[])fields.get(field.key).value=field.default||'';
    genreSearch.value='';updateGenreSearch();invalidate();
  }
  async function ensureFilters(){
    if(schema||loading)return;
    loading=true;retry.classList.add('hidden');metadataStatus.textContent='';syncControls();
    try {
      schema=await loadFilters();
      legend.textContent=schema.genreLabel;
      const source=document.createElement('span');source.className='random-catalog-source';source.textContent=schema.genres.length+' · '+schema.source;legend.append(source);
      for(const [value,label] of schema.genres){
        const item=button(label);item.dataset.genre=value;item.setAttribute('aria-pressed','false');
        item.addEventListener('click',()=>{selected.has(value)?selected.delete(value):selected.add(value);item.setAttribute('aria-pressed',String(selected.has(value)));invalidate();});
        genreChoices.append(item);
      }
      genreChoices.classList.toggle('random-genre-choices--long',schema.genres.length>24);
      for(const field of schema.fields){
        const label=document.createElement('label');label.textContent=field.label;
        const input=document.createElement(field.type==='select'?'select':'input');input.id=id+'-'+field.key;input.dataset.filter=field.key;input.setAttribute('aria-label',field.label);
        if(field.type==='select'){
          if(!field.default){const any=document.createElement('option');any.value='';any.textContent='Peu importe';input.append(any);}
          for(const [value,text] of field.options){const option=document.createElement('option');option.value=value;option.textContent=text;input.append(option);}
          input.value=field.default||'';
        }else{
          input.type='number';input.inputMode=field.step===1?'numeric':'decimal';input.min=field.min;input.max=field.max;input.step=field.step;input.placeholder='Libre';
        }
        input.addEventListener(field.type==='select'?'change':'input',invalidate);label.append(input);advancedGrid.append(label);fields.set(field.key,input);
      }
      invalidate();
    } catch(error){
      schema=null;metadataStatus.textContent='Filtres indisponibles.';retry.classList.remove('hidden');
    } finally {loading=false;syncControls();}
  }
  function setMode(next,focus=false){
    cancel();mode=next;const random=next==='random';searchPanel.classList.toggle('hidden',random);panel.classList.toggle('hidden',!random);
    searchTab.setAttribute('aria-selected',String(!random));randomTab.setAttribute('aria-selected',String(random));searchTab.tabIndex=random?-1:0;randomTab.tabIndex=random?0:-1;
    syncControls();if(random){onRandomMode?.();ensureFilters();}
    if(focus)(random?generateButton:searchPanel.querySelector('input'))?.focus({preventScroll:true});
  }
  function renderResult(media){
    stage.replaceChildren();const card=document.createElement('article');card.className='random-card';
    const art=document.createElement('div');art.className='random-card__art';art.append(createArtwork(media));
    const copy=document.createElement('div');copy.className='random-card__copy';
    const eyebrow=document.createElement('small');eyebrow.textContent='Et pourquoi pas…';const title=document.createElement('h4');title.textContent=media.title;
    const meta=document.createElement('p');meta.textContent=describe(media);
    const categories=document.createElement('span');categories.className='random-card__genres';categories.textContent=(media.genres||[]).slice(0,3).map(item=>item.name).join(' · ');
    copy.append(eyebrow,title,meta,categories);card.append(art,copy);stage.append(card);choose.classList.remove('hidden');choose.disabled=!enabled;
  }
  async function generate(){
    if(!enabled||busy||mode!=='random'||!schema)return;
    let filters;try{filters=validateRandomCriteria(criteria(),schema);}catch(error){status.textContent=error.message;return;}
    cancel();const ownRequest=++requestId;controller=new AbortController();const signal=controller.signal;let timedOut=false;const activeController=controller;
    const timeout=setTimeout(()=>{timedOut=true;activeController.abort();},30000);
    busy=true;panel.setAttribute('aria-busy','true');status.textContent='';syncControls();
    try{
      const media=await discover(filters,{signal,recent});if(signal.aborted||ownRequest!==requestId)return;
      if(!media){status.textContent=result?'Pas d’autre suggestion pour ces critères.':'Aucun résultat. Essaie avec moins de filtres.';return;}
      result=media;recent=[...recent,String(media.id)].slice(-20);renderResult(media);
    }catch(error){
      if(ownRequest===requestId&&(!signal.aborted||timedOut))status.textContent=timedOut?'Le catalogue met trop de temps. Réessaie.':error.message||'Recherche indisponible. Réessaie.';
    }finally{
      clearTimeout(timeout);if(ownRequest===requestId){busy=false;controller=null;panel.removeAttribute('aria-busy');syncControls();}
    }
  }
  retry.addEventListener('click',ensureFilters);
  genreSearch.addEventListener('input',()=>{updateGenreSearch();reset.classList.toggle('hidden',!genreSearch.value&&summaryLabel.textContent==='Sans filtre');});
  filterBody.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.tagName==='INPUT'){event.preventDefault();if(event.target!==genreSearch)generate();}});
  searchTab.addEventListener('click',()=>setMode('search'));randomTab.addEventListener('click',()=>setMode('random'));
  tabs.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();setMode(event.key==='Home'?'search':event.key==='End'?'random':mode==='search'?'random':'search');(mode==='random'?randomTab:searchTab).focus();}});
  generateButton.addEventListener('click',generate);
  choose.addEventListener('click',()=>{if(!result||busy||!enabled)return;const issue=canChoose?.(result);if(issue){status.textContent=issue;return;}const media=result;setMode('search');onChoose(media);});
  host.closest('form')?.addEventListener('reset',()=>{resetFilters();setMode('search');});
  invalidate();setMode('search');
  return {cancel,setMode,setEnabled(value){enabled=Boolean(value);tabs.classList.toggle('hidden',!enabled);searchTab.disabled=randomTab.disabled=!enabled;if(!enabled){cancel();setMode('search');}syncControls();}};
}
