import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
const { chromium } = await import('playwright').catch(
  () =>
    import(
      pathToFileURL(
        homedir() +
          '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs',
      ).href
    ),
);
import { readFile, writeFile, mkdir } from 'node:fs/promises';

export async function createFixtureBrowser(options = {}) {
await mkdir('tools/screenshots', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: options.cdpPort ? [`--remote-debugging-port=${options.cdpPort}`] : [],
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : process.platform === 'win32'
      ? { channel: 'chrome' }
      : {}),
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
  reducedMotion: options.reducedMotion || 'reduce',
});
const initialArt = await readFile('image/initial-d.jpg');
const photos = {
  '/initial.jpg':
    'https://image.tmdb.org/t/p/w600_and_h900_bestv2/xMSbtGNX9pftwfHwfTVeoEaVTSw.jpg',
  '/budapest.jpg':
    'https://www.avoir-alire.com/IMG/jpg/grand_budapest_hotel.jpg',
  '/whiplash.jpg':
    'https://i.pinimg.com/736x/f0/ef/f7/f0eff7f0339b62bdc6e33a6b231c2684.jpg',
  '/interstellar.jpg':
    'https://images.flickdirect.com/cache/movies/interstellar/06600-interstellar-poster.jpg',
};
const assets = new Map();
await Promise.all(
  Object.entries(photos).map(async ([key, url]) => {
    try {
      const cache = 'tools/screenshots' + key;
      let body;
      try {
        body = await readFile(cache);
      } catch {
        const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!r.ok) throw new Error();
        body = Buffer.from(await r.arrayBuffer());
        await writeFile(cache, body);
      }
      assets.set(key, body);
    } catch {
      assets.set(key, initialArt);
    }
  }),
);
const now = Date.now();
const fixture = {
  users: { ALEX: { isAdmin: true }, LOU: {}, NOA: {}, SAM: {} },
  movies: {
    m1: {
      tmdbId: 16411,
      title: 'Initial D',
      posterPath: '/initial.jpg',
      backdropPath: '/backdrop.jpg',
      proposedBy: 'ALEX',
      createdAt: 1,
      isPrimary: true,
      seenBy: { SAM: true },
    },
    m2: {
      tmdbId: 157336,
      title: 'Interstellar',
      posterPath: '/interstellar.jpg',
      proposedBy: 'LOU',
      createdAt: 2,
      isPrimary: true,
      seenBy: { ALEX: true },
    },
    m3: {
      tmdbId: 244786,
      title: 'Whiplash',
      posterPath: '/whiplash.jpg',
      proposedBy: 'NOA',
      createdAt: 3,
      isPrimary: true,
    },
    m4: {
      tmdbId: 120467,
      title: 'The Grand Budapest Hotel',
      posterPath: '/budapest.jpg',
      proposedBy: 'SAM',
      createdAt: 4,
      isPrimary: true,
    },
    m5: {
      title: 'Le prochain coup de cœur',
      proposedBy: 'ALEX',
      createdAt: 5,
      isPrimary: false,
    },
  },
  draw: {
    history: {
      h1: {
        tmdbId: 157336,
        title: 'Interstellar',
        posterPath: '/interstellar.jpg',
        proposedBy: 'LOU',
        drawnAt: now - 86400000,
        ratings: { ALEX: 5, SAM: 4 },
      },
      h2: {
        tmdbId: 244786,
        title: 'Whiplash',
        posterPath: '/whiplash.jpg',
        proposedBy: 'NOA',
        drawnAt: now - 172800000,
      },
      h3: {
        tmdbId: 120467,
        title: 'The Grand Budapest Hotel',
        posterPath: '/budapest.jpg',
        proposedBy: 'SAM',
        drawnAt: now - 259200000,
        ratings: { ALEX: 3 },
      },
    },
  },
  availability: {
    ALEX: {
      a: {
        type: 'weekly',
        days: [0, 1, 2, 3, 4, 5, 6],
        start: '20:00',
        end: '23:00',
      },
    },
    LOU: {
      a: {
        type: 'weekly',
        days: [0, 1, 2, 3, 4, 5, 6],
        start: '20:30',
        end: '23:30',
      },
    },
    SAM: {
      a: {
        type: 'weekly',
        days: [0, 1, 2, 3, 4, 5, 6],
        start: '19:30',
        end: '23:00',
      },
    },
  },
};
// A repeated screening must not resurrect a deleted personal rating.
fixture.draw.history.h1copy = {
  ...fixture.draw.history.h1,
  drawnAt: now - 345600000,
  ratings: { ALEX: 4 },
};
fixture.draw.history.h1.comments = {
  ALEX: { text: 'Un beau souvenir.', createdAt: now },
};
if(options.anipaff) {
  const anime=(await import('./anime-fixture.mjs')).animeFixture;
  fixture.anipaff=structuredClone(anime);
}
await context.addInitScript((data) => {
  window.__fixture = data;
  localStorage.setItem(
    'cinepaff_user',
    JSON.stringify({ id: 'ALEX', isAdmin: true }),
  );
}, fixture);
const fakeDB = `const data=window.__fixture;const listeners=[];let count=0;
const value=p=>p.split('/').filter(Boolean).reduce((v,k)=>v?.[k],data);
const snap=p=>({val:()=>structuredClone(value(p)),exists:()=>value(p)!=null});
window.__writes=0;window.__updates=[];const notify=()=>queueMicrotask(()=>listeners.forEach(([p,cb])=>cb(snap(p))));
function put(p,v){window.__writes++;const keys=p.split('/').filter(Boolean);const last=keys.pop();let target=data;for(const k of keys)target=target[k]??={};if(v===null)delete target[last];else target[last]=v;}
export const getDatabase=()=>({});export const ref=(_,p='')=>({path:p});export const get=async r=>snap(r.path);
export const set=async(r,v)=>{put(r.path,v);notify()};export const update=async(r,changes)=>{if(window.__failNextUpdate){window.__failNextUpdate=false;throw new Error('Simulated write failure')}window.__updates.push(structuredClone(changes));for(const[p,v]of Object.entries(changes))put([r.path,p].filter(Boolean).join('/'),v);notify()};export const remove=async r=>{put(r.path,null);notify()};export const push=(r,v)=>{const entry={path:r.path+'/test'+(++count),key:'test'+count};if(v!==undefined){put(entry.path,v);notify()}return entry};export const onValue=(r,cb)=>{listeners.push([r.path,cb]);queueMicrotask(()=>cb(snap(r.path)));return()=>{}};
window.__notify=notify;window.__emptyFixture=()=>{data.movies={};data.draw={};data.availability={};notify()};`;
await context.route('https://www.gstatic.com/firebasejs/**', (route) =>
  route.fulfill({
    contentType: 'application/javascript',
    body: route.request().url().includes('firebase-app.js')
      ? 'export const initializeApp=()=>({});'
      : fakeDB,
  }),
);
await context.route('https://api.themoviedb.org/**', async (route) => {
  const page = route.request().frame().page();
  if (await page.evaluate(() => window.__searchFail && location.href.startsWith('http://127.0.0.1'))) { return route.fulfill({status:503,body:''}); }
  const url = new URL(route.request().url());
  if (url.pathname.includes('/search/'))
    return route.fulfill({
      json: {
        results: [
          {id:64690,title:'Drive',poster_path:'/whiplash.jpg',backdrop_path:'/backdrop.jpg',release_date:'2011-09-16'},
          {
            id: 16411,
            title: 'Initial D',
            poster_path: '/initial.jpg',
            release_date: '2005-06-23',
            overview:
              'Un jeune livreur découvre le monde des courses de montagne.',
          },
        ],
      },
    });
  return route.fulfill({
    json: {
      runtime: 110,
      overview:
        'Un film à découvrir ensemble. Entre rencontres et défis, une nouvelle aventure commence. La séance se prolonge avec les avis et les souvenirs de toute la bande.',
      genres: [{ name: 'Drame' }],
      release_date: '2014-10-10',
      vote_average: 8.4,
      backdrop_path: '/backdrop.jpg',
      credits: { cast: [], crew: [] },
      images: { logos: [] },
      external_ids: {},
    },
  });
});
await context.route('https://image.tmdb.org/**', (route) =>
  route.fulfill({
    contentType: 'image/jpeg',
    body:
      assets.get(
        new URL(route.request().url()).pathname.match(/\/[^/]+$/)?.[0],
      ) || initialArt,
  }),
);
await context.route(/firebasedatabase\.app|firebaseio\.com/, (route) =>
  route.abort(),
);

return { browser, context, fixture };
}
