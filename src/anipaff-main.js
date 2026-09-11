import { validateRandomCriteria, matchesYear, matchesRange, matchesGenres, randomIndex, shuffled, cacheCatalogue, genreModeField, numberField } from './random-catalog.js?v=20260911-filters';
// AniList catalogue: direct requests, no global fetch interception or TMDB key.
const endpoint = 'https://graphql.anilist.co';
const mediaFields = 'id type isAdult title { romaji english native } description(asHtml:false) coverImage { extraLarge large } bannerImage startDate { year month day } format status episodes duration genres averageScore siteUrl';
const searchQuery = 'query SearchAnime($search:String!){ Page(page:1,perPage:18){ media(search:$search,type:ANIME,isAdult:false,sort:SEARCH_MATCH){ ' + mediaFields + ' } } }';
const detailQuery = 'query AnimeDetails($id:Int!){ Media(id:$id,type:ANIME){ ' + mediaFields + ' studios(isMain:true){nodes{name}} staff(perPage:15){edges{role node{name{full}}}} characters(perPage:3,sort:[ROLE,RELEVANCE]){edges{node{name{full}}}} } }';
const detailsCache = new Map();
let retryAt = 0;
let fallbackUntil = 0;

async function request(query, variables, signal) {
  if (Date.now() < retryAt) throw new Error('AniList est occupé. Réessaie dans un instant.');
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, 12000);
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type':'application/json', Accept:'application/json' }, body: JSON.stringify({query,variables}), signal: controller.signal });
    if (response.status === 429) {
      const retry = Number(response.headers.get('Retry-After')) || 60;
      retryAt = Date.now() + Math.min(300,Math.max(1,retry)) * 1000;
      throw new Error('AniList est occupé. Réessaie dans un instant.');
    }
    if (!response.ok) throw new Error('Catalogue indisponible. Réessaie.');
    const result = await response.json();
    if (result.errors?.length || !result.data) throw new Error('Catalogue indisponible. Réessaie.');
    return result.data;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

const formats = {TV:'Série',TV_SHORT:'Série courte',MOVIE:'Film d’animation',SPECIAL:'Spécial',OVA:'OVA',ONA:'ONA'};
const statuses = {FINISHED:'Terminé',RELEASING:'En cours',NOT_YET_RELEASED:'À venir',CANCELLED:'Annulé',HIATUS:'En pause'};
const genres = {Action:'Action',Adventure:'Aventure',Comedy:'Comédie',Drama:'Drame',Ecchi:'Ecchi',Fantasy:'Fantasy',Horror:'Horreur',MahouShoujo:'Magical girl',Mecha:'Mecha',Music:'Musique',Mystery:'Mystère',Psychological:'Psychologique',Romance:'Romance','Sci-Fi':'Science-fiction','Slice of Life':'Tranche de vie',Sports:'Sport',Supernatural:'Surnaturel',Thriller:'Thriller'};
export const isAnimeSeries = media => Boolean(media?.animeFormat && media.animeFormat !== 'MOVIE');
export const formatAnimeFormat = value => formats[value] || value || '';
export const formatAnimeStatus = value => statuses[value] || '';
export function animeImageUrl(url) {
  if (!url) return '';
  try { const parsed=new URL(url); return parsed.protocol==='https:' && (parsed.hostname==='anilist.co' || parsed.hostname.endsWith('.anilist.co') || ['media.kitsu.io','media.kitsu.app'].includes(parsed.hostname)) ? parsed.href : ''; } catch { return ''; }
}
function plainText(value) {
  const text=new DOMParser().parseFromString(String(value||'').replace(/<br\s*\/?>/gi,'\n'),'text/html');
  return (text.body.textContent||'').trim();
}
function convert(anime) {
  const title=anime.title?.english || anime.title?.romaji || anime.title?.native || 'Sans titre';
  const date=anime.startDate?.year ? [anime.startDate.year,String(anime.startDate.month||1).padStart(2,'0'),String(anime.startDate.day||1).padStart(2,'0')].join('-') : '';
  const duration=Number(anime.duration)>0 ? Number(anime.duration) : null;
  const episodes=Number(anime.episodes)>0 ? Number(anime.episodes) : null;
  const series=anime.format!=='MOVIE';
  const sessionEpisodes=series ? Math.min(3,episodes||3) : 1;
  return {
    id:'anilist-'+anime.id,catalogId:'anilist-'+anime.id,anilistId:anime.id,catalogName:'AniList',catalogUrl:'https://anilist.co/anime/'+anime.id,title,original_title:anime.title?.romaji||title,
    poster_path:animeImageUrl(anime.coverImage?.extraLarge||anime.coverImage?.large),backdrop_path:animeImageUrl(anime.bannerImage),
    release_date:date,overview:plainText(anime.description),animeFormat:anime.format||'',animeStatus:anime.status||'',
    episodes,episodeDuration:duration,sessionEpisodes,runtime:duration ? duration*sessionEpisodes : null,
    anilistScore:anime.averageScore||null,anilistUrl:'https://anilist.co/anime/'+anime.id,
    genres:(anime.genres||[]).map((name,index)=>({id:index+1,name:genres[name]||name})),
    studios:(anime.studios?.nodes||[]).map(studio=>studio.name),
    credits:{crew:(anime.staff?.edges||[]).filter(person=>person.role==='Director').map(person=>({job:'Director',name:person.node?.name?.full})),cast:(anime.characters?.edges||[]).map(person=>({name:person.node?.name?.full}))},
    images:{logos:[],backdrops:anime.bannerImage?[{file_path:animeImageUrl(anime.bannerImage)}]:[]},
  };
}
async function requestKitsu(path, signal) {
  const controller=new AbortController();const abort=()=>controller.abort();
  if(signal?.aborted)abort();signal?.addEventListener('abort',abort,{once:true});
  const timeout=setTimeout(abort,12000);
  try {
    const response=await fetch('https://kitsu.io/api/edge/'+path,{headers:{Accept:'application/vnd.api+json'},signal:controller.signal});
    if(!response.ok)throw new Error('Catalogue indisponible. Réessaie.');
    return await response.json();
  } finally {clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
}
function convertKitsu(item) {
  const a=item.attributes;
  const format={TV:'TV',movie:'MOVIE',special:'SPECIAL',OVA:'OVA',ONA:'ONA',music:'MUSIC'}[a.subtype]||'TV';
  const mapped=convert({id:Number(item.id),title:{english:a.titles?.en||a.canonicalTitle,romaji:a.titles?.en_jp||a.canonicalTitle},description:a.synopsis,format,
    startDate:a.startDate?{year:Number(a.startDate.slice(0,4)),month:Number(a.startDate.slice(5,7)),day:Number(a.startDate.slice(8,10))}:null,
    coverImage:{extraLarge:a.posterImage?.large||a.posterImage?.original},bannerImage:a.coverImage?.large||'',
    episodes:a.episodeCount,duration:a.episodeLength,averageScore:Number(a.averageRating)||null,
    status:{finished:'FINISHED',current:'RELEASING',upcoming:'NOT_YET_RELEASED',unreleased:'NOT_YET_RELEASED',tba:'NOT_YET_RELEASED'}[a.status]||'',
  });
  return {...mapped,id:'kitsu-'+item.id,catalogId:'kitsu-'+item.id,anilistId:null,catalogName:'Kitsu',catalogUrl:'https://kitsu.io/anime/'+encodeURIComponent(a.slug||item.id),anilistUrl:''};
}
export async function searchAnime(search, signal) {
  if(Date.now()>=fallbackUntil){
    try{
      const data=await request(searchQuery,{search:search.trim()},signal);
      return (data.Page?.media||[]).filter(item=>item.type==='ANIME'&&!item.isAdult&&item.format!=='MUSIC').slice(0,12).map(convert);
    }catch(error){if(signal?.aborted)throw error;fallbackUntil=Date.now()+600000;}
  }
  const data=await requestKitsu('anime?filter[text]='+encodeURIComponent(search.trim())+'&page[limit]=12',signal);
  return (data.data||[]).filter(item=>item.type==='anime'&&!item.attributes.nsfw&&item.attributes.ageRating!=='R18'&&item.attributes.subtype!=='music').map(convertKitsu);
}
export async function getAnimeDetails(catalogId, signal) {
  if(!/^(anilist|kitsu)-[1-9][0-9]*$/.test(catalogId))return null;
  if(detailsCache.has(catalogId))return detailsCache.get(catalogId);
  const [provider,id]=catalogId.split('-');
  const pending=(async()=>{
    if(provider==='kitsu'){
      const {data}=await requestKitsu('anime/'+id,signal);
      if(!data||data.type!=='anime'||data.attributes.nsfw||data.attributes.ageRating==='R18')throw new Error('Anime introuvable.');
      return convertKitsu(data);
    }
    const data=await request(detailQuery,{id:Number(id)},signal);
    if(!data.Media || data.Media.type!=='ANIME'||data.Media.isAdult)throw new Error('Anime introuvable.');
    return convert(data.Media);
  })();
  detailsCache.set(catalogId,pending);
  try{return await pending;}catch(error){detailsCache.delete(catalogId);throw error;}
}
export function animeMetadata(media) {
  return {
    catalogId:media.catalogId||media.id,catalogName:media.catalogName||'',catalogUrl:media.catalogUrl||'',
    animeFormat:media.animeFormat||'',animeStatus:media.animeStatus||'',
    episodes:media.episodes||null,episodeDuration:media.episodeDuration||null,
    sessionEpisodes:media.sessionEpisodes||1,runtime:media.runtime||null,
    anilistScore:media.anilistScore||null,
  };
}
export function sameAnime(first,second) {
  if(first.catalogId && first.catalogId===(second.catalogId||second.id))return true;
  const title=media=>String(media.originalTitle||media.original_title||media.title||'').normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  const year=media=>(media.releaseDate||media.release_date||'').slice(0,4);
  return Boolean(title(first)&&year(first)&&first.animeFormat&&title(first)===title(second)&&year(first)===year(second)&&first.animeFormat===second.animeFormat);
}
export function animeMetaLabel(media) {
  return [formatAnimeFormat(media.animeFormat),media.episodes ? media.episodes+' ép.' : '',formatAnimeStatus(media.animeStatus)].filter(Boolean).join(' · ');
}

// Labels only: available genres and themes always come from the active catalogue.
const categoryLabels={
  ...genres, 'Science Fiction':'Science-fiction','Slice of Life':'Tranche de vie',
  'Martial Arts':'Arts martiaux','Super Power':'Super-pouvoirs','Historical':'Historique',
  'School':'École','School Life':'Vie scolaire','Middle School':'Collège','High School':'Lycée',
  'Time Travel':'Voyage dans le temps','Space':'Espace','Military':'Militaire','Vampires':'Vampires',
  'Virtual Reality':'Réalité virtuelle','Post-Apocalyptic':'Post-apocalyptique','Coming of Age':'Passage à l’âge adulte',
  'Police':'Police','Racing':'Courses automobiles','Cars':'Automobile','Demons':'Démons',
  'Magic':'Magie','Friendship':'Amitié','Reincarnation':'Réincarnation','Revenge':'Vengeance',
};
const labelCategory=name=>categoryLabels[name]||name;
const discoveryMetadataQuery='query DiscoveryFilters { GenreCollection MediaTagCollection { name isAdult } }';
// AniList rejects comparison arguments set to null ("Illegal operator and value combination").
// Compile only active arguments; values always remain in GraphQL variables.
function randomAnimeRequest(values) {
  const definitions=[
    ['genre','String','genre'],['tag','String','tag'],
    ['allGenres','[String]','genre_in'],['allTags','[String]','tag_in'],
    ['from','FuzzyDateInt','startDate_greater'],['to','FuzzyDateInt','startDate_lesser'],
    ['format','MediaFormat','format'],['status','MediaStatus','status'],
    ['episodesFrom','Int','episodes_greater'],['episodesTo','Int','episodes_lesser'],
    ['durationFrom','Int','duration_greater'],['durationTo','Int','duration_lesser'],
    ['score','Int','averageScore_greater'],
  ].filter(([key])=>values[key]!=null&&values[key]!==''&&(!Array.isArray(values[key])||values[key].length));
  const declarations=['$page:Int!',...definitions.map(([key,type])=>'$'+key+':'+type)].join(',');
  const argumentsList=['type:ANIME','isAdult:false','sort:ID',...definitions.map(([key,,argument])=>argument+':$'+key)].join(',');
  return {
    query:'query RandomAnime('+declarations+'){ Page(page:$page,perPage:50){ pageInfo { total lastPage } media('+argumentsList+'){ '+mediaFields+' tags { name rank isAdult } } } }',
    variables:{page:values.page,...Object.fromEntries(definitions.map(([key])=>[key,values[key]]))},
  };
}
function animeFields(provider){
  return [
    genreModeField,numberField('scoreMin','Note min. · /10',0,10,.1),
    {key:'format',label:'Format',type:'select',options:provider==='AniList'?Object.entries(formats):[['TV','Série'],['movie','Film d’animation'],['OVA','OVA'],['ONA','ONA'],['special','Spécial']]},
    {key:'status',label:'Statut',type:'select',options:provider==='AniList'?Object.entries(statuses):[['finished','Terminé'],['current','En cours'],['upcoming','À venir'],['unreleased','Pas encore sorti'],['tba','Date à annoncer']]},
    numberField('episodesFrom','Épisodes min.',1,10000),numberField('episodesTo','Épisodes max.',1,10000),
    numberField('durationFrom','Durée / ép. min. · minutes',1,1000),numberField('durationTo','Durée / ép. max. · minutes',1,1000),
  ];
}
export const getAnimeDiscoveryFilters=cacheCatalogue(async()=>{
  const signal=AbortSignal.timeout(25000);
  if(Date.now()>=fallbackUntil){
    try{
      const data=await request(discoveryMetadataQuery,{},signal);
      if(!data.GenreCollection?.length||!Array.isArray(data.MediaTagCollection))throw new Error('Filtres indisponibles.');
      const main=data.GenreCollection.filter(name=>name!=='Hentai').map(name=>['genre:'+name,labelCategory(name)]);
      const tags=data.MediaTagCollection.filter(tag=>!tag.isAdult&&tag.name).map(tag=>['tag:'+tag.name,labelCategory(tag.name)]);
      return {source:'AniList',genreLabel:'Genres & thèmes',genres:[...main,...tags.sort((a,b)=>a[1].localeCompare(b[1],'fr'))],fields:animeFields('AniList')};
    }catch(error){if(signal.aborted)throw error;fallbackUntil=Date.now()+600000;}
  }
  const all=[];
  let offset=0,count=1;
  while(offset<count){
    const page=await requestKitsu('categories?page[limit]=40&page[offset]='+offset,signal);
    if(!Array.isArray(page.data)||!Number.isFinite(page.meta?.count)||(!page.data.length&&offset<page.meta.count))throw new Error('Filtres indisponibles. Réessaie.');
    all.push(...page.data);count=page.meta.count;offset+=page.data.length;
    if(count>5000)throw new Error('Filtres indisponibles. Réessaie.');
  }
  const choices=[...new Map(all.filter(item=>item.type==='categories'&&!item.attributes.nsfw&&item.attributes.slug&&item.attributes.title).map(item=>[item.attributes.slug,[item.attributes.slug,labelCategory(item.attributes.title)]])).values()];
  if(!choices.length)throw new Error('Filtres indisponibles. Réessaie.');
  // Put common genres first; retain every remaining catalogue category below.
  const mainNames=new Set(Object.values(genres));
  choices.sort((a,b)=>Number(mainNames.has(b[1]))-Number(mainNames.has(a[1]))||a[1].localeCompare(b[1],'fr'));
  return {source:'Kitsu',genreLabel:'Genres & thèmes',genres:choices,fields:animeFields('Kitsu')};
});
function kitsuCategories(item,included=[]){
  const ids=new Set((item.relationships?.categories?.data||[]).map(category=>String(category.id)));
  return included.filter(category=>category.type==='categories'&&ids.has(String(category.id)));
}
function matchesAnimeDetails(item,filters){
  return matchesYear(item.release_date,filters)&&matchesRange(item.episodes,filters.episodesFrom,filters.episodesTo)&&matchesRange(item.episodeDuration,filters.durationFrom,filters.durationTo)&&matchesRange(item.anilistScore,filters.scoreMin==null?null:filters.scoreMin*10,null);
}
async function randomFromAniList(filters,signal,exclude){
  const groups=filters.genreMode==='all'?[null]:shuffled(filters.genres.length?filters.genres:[null]);
  for(const selected of groups){
    const variables={
      page:1,genre:selected?.startsWith('genre:')?selected.slice(6):null,tag:selected?.startsWith('tag:')?selected.slice(4):null,
      allGenres:filters.genreMode==='all'&&filters.genres.some(id=>id.startsWith('genre:'))?filters.genres.filter(id=>id.startsWith('genre:')).map(id=>id.slice(6)):null,
      allTags:filters.genreMode==='all'&&filters.genres.some(id=>id.startsWith('tag:'))?filters.genres.filter(id=>id.startsWith('tag:')).map(id=>id.slice(4)):null,
      from:filters.yearFrom?filters.yearFrom*10000:null,to:filters.yearTo?(filters.yearTo+1)*10000:null,
      format:filters.format||null,status:filters.status||null,
      // Broaden inclusive bounds by one; validate the exact bounds on returned media.
      episodesFrom:filters.episodesFrom==null?null:filters.episodesFrom-1,episodesTo:filters.episodesTo==null?null:filters.episodesTo+1,
      durationFrom:filters.durationFrom==null?null:filters.durationFrom-1,durationTo:filters.durationTo==null?null:filters.durationTo+1,
      score:filters.scoreMin==null?null:Math.round(filters.scoreMin*10)-1,
    };
    const active=randomAnimeRequest(variables);
    const first=await request(active.query,active.variables,signal);
    if(!first.Page||!Array.isArray(first.Page.media))throw new Error('Catalogue indisponible. Réessaie.');
    if(!first.Page.media.length)continue;
    const count=Math.max(1,Math.min(500,first.Page.pageInfo?.lastPage||Math.ceil((first.Page.pageInfo?.total||50)/50)));
    for(const page of [...new Set([randomIndex(count)+1,randomIndex(count)+1,1])]){
      signal?.throwIfAborted();
      const data=page===1?first:await request(active.query,{...active.variables,page},signal);
      const candidates=(data.Page?.media||[]).filter(item=>{
        const categories=[...(item.genres||[]).map(name=>'genre:'+name),...(item.tags||[]).filter(tag=>!tag.isAdult&&tag.rank>=18).map(tag=>'tag:'+tag.name)];
        return item.type==='ANIME'&&!item.isAdult&&item.format!=='MUSIC'&&matchesGenres(categories,filters)&&(!filters.format||item.format===filters.format)&&(!filters.status||item.status===filters.status);
      }).map(item=>{
        const media=convert(item);
        const selectedNames=filters.genres.map(id=>labelCategory(id.slice(id.startsWith('genre:')?6:4)));
        const tags=(item.tags||[]).filter(tag=>!tag.isAdult&&tag.rank>=18&&filters.genres.includes('tag:'+tag.name)).map(tag=>({id:'tag:'+tag.name,name:labelCategory(tag.name)}));
        media.genres=[...media.genres,...tags].sort((a,b)=>Number(selectedNames.includes(b.name))-Number(selectedNames.includes(a.name)));
        return media;
      }).filter(item=>matchesAnimeDetails(item,filters)&&!exclude(item));
      if(candidates.length)return candidates[randomIndex(candidates.length)];
    }
  }
  return null;
}
async function randomFromKitsu(filters,signal,exclude){
  const groups=filters.genreMode==='all'?[filters.genres.join(',')||null]:shuffled(filters.genres.length?filters.genres:[null]);
  for(const category of groups){
    const params=new URLSearchParams({'page[limit]':'20',include:'categories'});
    if(category)params.set('filter[categories]',category);
    const range=(key,from,to,multiplier=1)=>{
      if(from!=null||to!=null)params.set('filter['+key+']',(from==null?'':from*multiplier)+'..'+(to==null?'':to*multiplier));
    };
    range('year',filters.yearFrom,filters.yearTo);
    range('episodeCount',filters.episodesFrom,filters.episodesTo);
    // Live Kitsu filtering uses seconds, while response episodeLength uses minutes.
    range('episodeLength',filters.durationFrom,filters.durationTo,60);
    range('averageRating',filters.scoreMin,null,10);
    if(filters.format)params.set('filter[subtype]',filters.format);
    if(filters.status)params.set('filter[status]',filters.status);
    const getPage=async offset=>{const query=new URLSearchParams(params);query.set('page[offset]',offset);return requestKitsu('anime?'+query,signal);};
    const first=await getPage(0);
    if(!Array.isArray(first.data)||!Number.isFinite(first.meta?.count))throw new Error('Catalogue indisponible. Réessaie.');
    if(!first.meta.count)continue;
    const pages=Math.ceil(first.meta.count/20);
    for(const page of [...new Set([randomIndex(pages),randomIndex(pages),0])]){
      signal?.throwIfAborted();
      const data=page===0?first:await getPage(page*20);
      const candidates=(data.data||[]).filter(item=>item.type==='anime'&&!item.attributes.nsfw&&item.attributes.ageRating!=='R18'&&item.attributes.subtype!=='music'&&matchesGenres(kitsuCategories(item,data.included).map(category=>category.attributes.slug),filters)&&(!filters.format||item.attributes.subtype===filters.format)&&(!filters.status||item.attributes.status===filters.status)).map(item=>{
        const media=convertKitsu(item);
        media.genres=kitsuCategories(item,data.included).filter(category=>!category.attributes.nsfw).sort((a,b)=>Number(filters.genres.includes(b.attributes.slug))-Number(filters.genres.includes(a.attributes.slug))).map(category=>({id:category.id,name:labelCategory(category.attributes.title)}));
        return media;
      }).filter(item=>matchesAnimeDetails(item,filters)&&!exclude(item));
      if(candidates.length){const chosen=candidates[randomIndex(candidates.length)];detailsCache.set(chosen.catalogId,Promise.resolve(chosen));return chosen;}
    }
  }
  return null;
}
export async function randomAnime(criteria,{signal,exclude=()=>false}={}){
  const schema=await getAnimeDiscoveryFilters();signal?.throwIfAborted();
  const filters=validateRandomCriteria(criteria,schema);
  if(schema.source==='Kitsu')return randomFromKitsu(filters,signal,exclude);
  try{return await randomFromAniList(filters,signal,exclude);}
  catch(error){
    if(signal?.aborted)throw error;
    // Never discard a provider-specific genre or theme during an outage.
    const formatMap={TV:'TV',MOVIE:'movie',SPECIAL:'special',OVA:'OVA',ONA:'ONA'};
    const statusMap={FINISHED:'finished',RELEASING:'current'};
    if(filters.genres.length||(filters.format&&!formatMap[filters.format])||(filters.status&&!statusMap[filters.status]))throw error;
    return randomFromKitsu({...filters,format:formatMap[filters.format]||'',status:statusMap[filters.status]||''},signal,exclude);
  }
}
