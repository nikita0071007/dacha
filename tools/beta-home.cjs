const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const file=path.resolve(process.argv[2]||'beta/index.html'),out=path.resolve(process.argv[3]||'beta/verify-out');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const [w,h] of [[360,640],[390,800],[412,915]]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:1,reducedMotion:'reduce'});
  await ctx.addInitScript(()=>localStorage.setItem('dacha3v2',JSON.stringify({who:'girl',visitorName:'QA',level:4,stars:200,lives:5,pets:['cat','dog'],bought:['house','fence'],houseStage:1,fenceStage:1})));
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+file);
  await page.locator('#spPlay').click();await page.evaluate(()=>{try{closeModal()}catch(e){};renderHome();});
  for(const [hs,fs,expectedHouse,expectedFence,label] of [[1,1,'ruined','ruined','ruined'],[2,2,'half','half','half'],[5,4,'ready','ready','ready'],[5,1,'ready','ruined','mixed']]){
   const state=await page.evaluate(([house,fence])=>{S.houseStage=house;S.fenceStage=fence;renderHome();return window.betaHomeSnapshot();},[hs,fs]);
   assert.equal(state.houseVisual,expectedHouse);assert.equal(state.fenceVisual,expectedFence);
   const photo=await page.locator('#home').evaluate(el=>getComputedStyle(el).backgroundImage);
   assert.match(photo,expectedHouse==='ready'?/data:image\/webp/:new RegExp('home-'+expectedHouse+'\\.webp'));
   const visibleSvg=await page.locator('#scene .it[data-item="house"] svg').evaluate(el=>getComputedStyle(el).display);
   assert.equal(visibleSvg,'none','no code-drawn house visible');
   await page.screenshot({path:path.join(out,'home-B-'+label+'-'+w+'x'+h+'.png')});
  }
  // Real repair click must retain old cost/state and leave fence progress untouched.
  const before=await page.evaluate(()=>{S.houseStage=1;S.fenceStage=1;S.stars=200;renderHome();return betaHomeSnapshot();});
  await page.locator('#betaHouseStage').click();
  const after=await page.evaluate(()=>betaHomeSnapshot());
  assert.equal(after.house,2);assert.equal(after.fence,before.fence);
  assert.equal(after.stars,200-HOUSE_STAGES[2].c);
  assert.match(await page.locator('#playBtn').innerText(),/Играть: уровень 5/);
  assert.equal(await page.locator('#levels .lv').count(),50);
  await page.locator('#playBtn').click();assert.equal(await page.locator('#game').isVisible(),true);
  assert.deepEqual(errors,[],'browser errors');
  console.log('PASS point B '+w+'x'+h+' all 3 states, separate fence, costs, play and levels');
  await ctx.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
