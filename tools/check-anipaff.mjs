import {createFixtureBrowser} from './browser-fixture.mjs';
import fs from 'node:fs';
const {browser,context}=await createFixtureBrowser({anipaff:true,cdpPort:process.argv.includes('--hold')?9223:undefined});
const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
const records=JSON.parse(fs.readFileSync('tools/fixtures/kitsu-catalog.json','utf8'));
await context.route('https://graphql.anilist.co',route=>route.fulfill({status:403,json:{errors:[{message:'Temporarily disabled'}]}}));
await context.route('https://kitsu.io/api/edge/**',route=>{const u=new URL(route.request().url());const id=u.pathname.match(/anime\/(\d+)/)?.[1];return route.fulfill({json:{data:id?records.find(item=>item.id===id):records}})});
try{
  await page.goto('http://127.0.0.1:4173/anipaff.html');
  await page.waitForTimeout(1500);
  console.log('Errors:',errors);
  console.log('Title:',await page.title());
  console.log('Visible:',(await page.locator('body').innerText()).slice(0,800));
  await page.screenshot({path:'tools/screenshots/anipaff-home.jpg',type:'jpeg',quality:70,fullPage:true});
  if(process.argv.includes('--hold')) {console.log('Browser fixture ready on CDP 9223.');await new Promise(resolve=>process.on('SIGINT',resolve));}
}finally{await browser.close()}
