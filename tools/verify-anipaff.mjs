import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createFixtureBrowser} from './browser-fixture.mjs';
const {browser,context}=await createFixtureBrowser({anipaff:true});
const page=await context.newPage();const errors=[],tmdb=[];
page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('themoviedb'))tmdb.push(request.url())});
const records=JSON.parse(fs.readFileSync('tools/fixtures/kitsu-catalog.json','utf8'));
await context.route('https://graphql.anilist.co',route=>route.fulfill({status:403,json:{errors:[{message:'Temporarily disabled'}]}}));
await context.route('https://kitsu.io/api/edge/**',async route=>{
  if(await page.evaluate(()=>window.__catalogFail))return route.fulfill({status:503,json:{}});
  const url=new URL(route.request().url()),id=url.pathname.match(/anime\/(\d+)/)?.[1];
  return route.fulfill({json:{data:id?records.find(item=>item.id===id):records}});
});
const go=async route=>{await page.locator('button[data-route="'+route+'"]').click();await page.locator('[data-view="'+route+'"]').waitFor({state:'visible'})};
const shot=name=>page.screenshot({path:'tools/screenshots/'+name+'.jpg',type:'jpeg',quality:72,fullPage:true});
const cineData=()=>page.evaluate(()=>JSON.stringify([window.__fixture.movies,window.__fixture.draw,window.__fixture.availability,window.__fixture.screenings,window.__fixture.screeningEvents]));
try {
  await page.goto('http://127.0.0.1:4173/anipaff.html');await page.locator('#homeView').waitFor({state:'visible'});
  const original=await cineData();
  assert.match(await page.title(),/AniPaff/);
  assert.equal(await page.locator('#movieGrid').count(),0); // IDs stay as provided by the original app.
  assert.equal(await page.locator('#currentUser').innerText(),'ALEX');
  assert.equal(await page.getByRole('link',{name:'Passer sur CinePaff'}).isVisible(),true);
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily.includes('Manrope')),true);
  assert.equal(await page.locator('#homeView h2').evaluate(el=>getComputedStyle(el).fontFamily.includes('Reggae One')),true);
  await page.getByRole('button',{name:'Marquer Cowboy Bebop comme déjà vu',exact:true}).click();
  assert.ok(await page.evaluate(()=>window.__fixture.anipaff.movies.a1.seenBy.ALEX));
  await page.getByRole('button',{name:'Voir la fiche de Cowboy Bebop',exact:true}).click();
  await page.locator('#ratingModalImdb').filter({hasText:'Kitsu'}).waitFor();
  assert.match(await page.locator('#ratingModalFacts').innerText(),/26/);
  assert.match(await page.locator('#ratingModalFacts').innerText(),/25 min/);
  await page.locator('#ratingModalClose').click();
  await page.locator('#movieQuery').fill('Cowboy');
  await page.locator('#results button').first().click();
  await page.locator('#animeSessionEpisodes').fill('5');
  assert.equal(await page.locator('#animeSessionDuration').innerText(),'2 h 5 min');
  await page.locator('#confirmMovieSelection').click();
  await page.waitForFunction(()=>Object.values(window.__fixture.anipaff.movies).some(item=>item.proposedBy==='ALEX'));
  const proposed=await page.evaluate(()=>Object.entries(window.__fixture.anipaff.movies).find(([,item])=>item.proposedBy==='ALEX'));
  assert.equal(proposed[1].catalogId,'kitsu-1');assert.equal(proposed[1].runtime,125);assert.equal(proposed[1].sessionEpisodes,5);
  assert.equal(proposed[1].tmdbId,undefined);
  await page.locator('#movieQuery').fill('Cowboy');await page.locator('#results button').first().waitFor();
  assert.equal(await page.locator('#results button').first().isDisabled(),true);
  await page.locator('#movieQuery').fill('');
  await go('screenings');await page.locator('#newScreening').click();
  await page.locator('#screeningQuery').fill('Cowboy');await page.locator('#screeningResults button').first().click();
  const date=await page.evaluate(()=>{const d=new Date(Date.now()+172800000);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'T20:30'});
  await page.locator('#screeningDateTime').fill(date);
  await page.locator('#screeningEpisodeStart').fill('5');await page.locator('#screeningEpisodeEnd').fill('2');await page.locator('#saveScreening').click();
  await page.locator('#screeningFormError').filter({hasText:'Vérifie'}).waitFor();
  assert.equal(await page.evaluate(()=>Object.keys(window.__fixture.anipaff.screenings).length),0);
  await page.locator('#screeningEpisodeStart').fill('2');await page.locator('#screeningEpisodeEnd').fill('4');
  await page.locator('#saveScreening').click();await page.locator('#screeningForm').waitFor({state:'hidden'});
  const key=await page.evaluate(()=>Object.keys(window.__fixture.anipaff.screenings)[0]);
  assert.equal(await page.evaluate(k=>window.__fixture.anipaff.screenings[k].episodeEnd,key),4);
  assert.equal(await page.evaluate(()=>window.__fixture.anipaff.screeningEvents),undefined);
  await page.getByRole('button',{name:'Modifier la soirée Cowboy Bebop',exact:true}).click();
  assert.equal(await page.locator('#screeningEpisodeStart').inputValue(),'2');
  await page.locator('#screeningEpisodeEnd').fill('5');await page.locator('#saveScreening').click();await page.locator('#screeningForm').waitFor({state:'hidden'});
  assert.match(await page.locator('#upcomingScreenings').innerText(),/Épisodes 2 à 5/);
  await shot('anipaff-screenings');
  await page.getByRole('button',{name:'Annuler la soirée Cowboy Bebop',exact:true}).click();await page.locator('#deleteHistoryConfirm').click();await page.locator('#deleteHistoryModal').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>Object.keys(window.__fixture.anipaff.screenings).length),0);
  await go('draws');await page.locator('#drawKeepSelectionToggle').click();await page.locator('#drawForcedMovie').selectOption(proposed[0]);
  const beforeTest=await page.evaluate(()=>window.__writes);
  await page.locator('#drawButton').click();await page.locator('#ratingModal').waitFor({state:'visible'});await page.locator('#ratingModalClose').click();
  assert.equal(await page.evaluate(()=>window.__writes),beforeTest,'test draw writes nothing');
  await page.locator('#drawKeepSelectionToggle').click();await page.locator('#drawForcedMovie').selectOption(proposed[0]);
  await page.locator('#drawButton').click();await page.locator('#ratingModal').waitFor({state:'visible'});await page.locator('#ratingModalClose').click();
  assert.equal(await page.evaluate(()=>window.__fixture.anipaff.draw.current.runtime),125);
  assert.equal(await page.evaluate(k=>window.__fixture.anipaff.movies[k],proposed[0]),undefined);
  await go('seen');await page.getByRole('button',{name:/Voir la fiche de Cowboy Bebop/}).first().click();
  await page.locator('#ratingModalClear').click();
  await page.waitForFunction(()=>!window.__fixture.anipaff.draw.history.animeHistory.ratings?.ALEX);
  await page.locator('#ratingModalClose').click();
  assert.equal(await cineData(),original,'anime activity must not change CinePaff or its Discord queue');
  const writes=await page.evaluate(()=>window.__updates.flatMap(update=>Object.keys(update)));
  assert.ok(writes.every(path=>path.startsWith('anipaff/')),'all anime multipath writes are scoped');
  assert.deepEqual(tmdb,[],'no movie catalogue requests from AniPaff');
  for(const width of [1440,768,390,320]){
    await page.setViewportSize({width,height:900});
    for(const route of ['home','screenings','seen','availability','profile','draws']){
      await go(route);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+route+' '+width);
      if(['home','profile','availability'].includes(route))await shot('anipaff-'+route+'-'+width);
    }
  }
  await page.setViewportSize({width:1440,height:1000});await go('profile');
  await page.locator('#profileIdInput').fill('ALEX2');await page.locator('#profileIdSubmit').click();
  await page.waitForFunction(()=>Boolean(window.__fixture.users.ALEX2));
  assert.equal(await page.evaluate(()=>window.__fixture.users.ALEX),undefined);
  assert.equal(await page.evaluate(()=>window.__fixture.movies.m1.proposedBy),'ALEX2');
  assert.equal(await page.evaluate(()=>window.__fixture.anipaff.draw.current.proposedBy),'ALEX2');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('cinepaff_user')).id),'ALEX2');
  await page.locator('#profileLogoutButton').click();await page.locator('#authPage').waitFor({state:'visible'});
  for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});await shot('anipaff-auth-'+width);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'auth overflow');}
  assert.deepEqual(errors,[]);
  console.log('PASS: anime search with provider fallback; real metadata and episodes; proposals; seen markers; scheduled episode create/edit/cancel; test draw zero writes; real draw and ratings isolated; shared account rename; responsive routes and auth; no CinePaff/Discord mutations.');
} catch(error){await shot('anipaff-failure');console.error(errors);throw error;}finally{await browser.close();}
