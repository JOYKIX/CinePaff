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
