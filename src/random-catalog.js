// Catalogue-owned options are loaded once per page and shared by both pickers.
export function cacheCatalogue(load) {
  let pending;
  return () => {
    if (!pending) pending = Promise.resolve().then(load).catch(error => { pending=null; throw error; });
    return pending;
  };
}
export const genreModeField = {key:'genreMode',label:'Genres choisis',type:'select',default:'any',options:[['any','Au moins un'],['all','Tous ensemble']]};
export const numberField = (key,label,min,max,step=1) => ({key,label,type:'number',min,max,step});
export function validateRandomCriteria(criteria, schema) {
  const options=Array.isArray(schema)?{genres:schema,fields:[]}:schema;
  const parseNumber = (value,field) => {
    if (value === '' || value == null) return null;
    const n=Number(value),step=field.step||1;
    if (!Number.isFinite(n)||n<field.min||n>field.max||Math.abs(n/step-Math.round(n/step))>0.00001) throw new Error('Vérifie « '+field.label+' ».');
    return n;
  };
  const yearField={label:'Années',min:1870,max:new Date().getFullYear()+5};
  const yearFrom=parseNumber(criteria.yearFrom,yearField),yearTo=parseNumber(criteria.yearTo,yearField);
  if(yearFrom&&yearTo&&yearFrom>yearTo)throw new Error('L’année de début doit précéder celle de fin.');
  const allowed=new Set(options.genres.map(([id])=>String(id)));
  const genres=[...new Set(criteria.genres||[])].map(String);
  if(genres.some(id=>!allowed.has(id)))throw new Error('Choisis un genre valide.');
  const result={genres,yearFrom,yearTo};
  for(const field of options.fields){
    const value=criteria[field.key]??field.default??'';
    if(field.type==='number')result[field.key]=parseNumber(value,field);
    else {
      if(value!==''&&!field.options.some(([id])=>String(id)===String(value)))throw new Error('Vérifie « '+field.label+' ».');
      result[field.key]=String(value);
    }
  }
  for(const [from,to,label] of [['durationFrom','durationTo','durées'],['episodesFrom','episodesTo','épisodes']]){
    if(result[from]!=null&&result[to]!=null&&result[from]>result[to])throw new Error('Vérifie l’ordre des '+label+'.');
  }
  return result;
}
export function randomIndex(length) {
  if(length<1)return 0;
  const values=new Uint32Array(1);crypto.getRandomValues(values);
  return Math.floor(values[0]/4294967296*length);
}
export function shuffled(values) {
  const result=[...values];
  for(let i=result.length-1;i>0;i--){const j=randomIndex(i+1);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function matchesYear(date,criteria) {
  if(!criteria.yearFrom&&!criteria.yearTo)return true;
  const year=Number(String(date||'').slice(0,4));
  return year>0&&(!criteria.yearFrom||year>=criteria.yearFrom)&&(!criteria.yearTo||year<=criteria.yearTo);
}
export function matchesRange(value,from,to) {
  if(from==null&&to==null)return true;
  return value!=null&&Number.isFinite(Number(value))&&(from==null||Number(value)>=from)&&(to==null||Number(value)<=to);
}
export function matchesGenres(values,filters) {
  return !filters.genres.length||(filters.genreMode==='all'?filters.genres.every(id=>values.includes(id)):filters.genres.some(id=>values.includes(id)));
}
const movieSchemas=new WeakMap();
export function getMovieDiscoveryFilters(request) {
  if(!movieSchemas.has(request))movieSchemas.set(request,cacheCatalogue(async()=>{
    const signal=AbortSignal.timeout(12000);
    const [genreData,languages,countries]=await Promise.all([
      request('genre/movie/list?language=fr-FR',signal),
      request('configuration/languages',signal),
      request('configuration/countries?language=fr-FR',signal),
    ]);
    if(!genreData.genres?.length||!Array.isArray(languages)||!languages.length||!Array.isArray(countries)||!countries.length)throw new Error('Filtres indisponibles. Réessaie.');
    const names=new Intl.DisplayNames(['fr'],{type:'language'});
    const sort=rows=>rows.sort((a,b)=>a[1].localeCompare(b[1],'fr'));
    return {
      source:'TMDB',genreLabel:'Genres',genres:sort(genreData.genres.map(item=>[String(item.id),item.name])),
      fields:[
        genreModeField,numberField('scoreMin','Note min. · /10',0,10,.1),
        {key:'language',label:'Langue originale',type:'select',options:sort(languages.map(item=>[item.iso_639_1,names.of(item.iso_639_1)||item.english_name]))},
        {key:'country',label:'Pays d’origine',type:'select',options:sort(countries.map(item=>[item.iso_3166_1,item.native_name||item.english_name]))},
        numberField('durationFrom','Durée min. · minutes',1,1000),numberField('durationTo','Durée max. · minutes',1,1000),
        numberField('votesMin','Nombre d’avis min.',0,1000000),
      ],
    };
  }));
  return movieSchemas.get(request)();
}
export async function randomMovie(criteria,{request,signal,exclude=()=>false}) {
  const schema=await getMovieDiscoveryFilters(request);signal?.throwIfAborted();
  const filters=validateRandomCriteria(criteria,schema);
  const params=new URLSearchParams({language:'fr-FR',include_adult:'false',include_video:'false',sort_by:'popularity.desc'});
  if(filters.genres.length)params.set('with_genres',filters.genres.join(filters.genreMode==='all'?',':'|'));
  if(filters.yearFrom)params.set('primary_release_date.gte',filters.yearFrom+'-01-01');
  if(filters.yearTo)params.set('primary_release_date.lte',filters.yearTo+'-12-31');
  for(const [key,param] of [['language','with_original_language'],['country','with_origin_country'],['durationFrom','with_runtime.gte'],['durationTo','with_runtime.lte'],['scoreMin','vote_average.gte'],['votesMin','vote_count.gte']]){
    if(filters[key]!==''&&filters[key]!=null)params.set(param,filters[key]);
  }
  const getPage=async page=>{
    const query=new URLSearchParams(params);query.set('page',page);
    const data=await request('discover/movie?'+query,signal);
    if(!Array.isArray(data.results)||!Number.isFinite(data.total_pages))throw new Error('Catalogue indisponible. Réessaie.');
    return data;
  };
  const first=await getPage(1);
  if(!first.total_pages)return null;
  const count=Math.min(500,first.total_pages);
  for(const page of [...new Set([randomIndex(count)+1,randomIndex(count)+1,1])]){
    signal?.throwIfAborted();
    const data=page===1?first:await getPage(page);
    const list=data.results.filter(movie=>movie.id&&movie.title&&!movie.adult&&matchesYear(movie.release_date,filters)&&matchesGenres((movie.genre_ids||[]).map(String),filters)&&(!filters.language||movie.original_language===filters.language)&&matchesRange(movie.vote_average,filters.scoreMin,null)&&matchesRange(movie.vote_count,filters.votesMin,null)&&!exclude(movie));
    for(const movie of shuffled(list)){
      let details={};
      if(filters.durationFrom!=null||filters.durationTo!=null||filters.country){
        details=await request('movie/'+movie.id+'?language=fr-FR',signal);
        if(!matchesRange(details.runtime,filters.durationFrom,filters.durationTo)||(filters.country&&!details.origin_country?.includes(filters.country)))continue;
      }
      return {...movie,...details,genres:schema.genres.filter(([id])=>(movie.genre_ids||[]).includes(Number(id))).map(([id,name])=>({id:Number(id),name}))};
    }
  }
  return null;
}
