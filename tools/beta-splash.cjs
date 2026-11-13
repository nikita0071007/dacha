const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const file=path.resolve(process.argv[2]||'beta/index.html'),out=path.resolve(process.argv[3]||'beta/verify-out');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const [width,height] of [[360,640],[390,800],[412,915]]){
  for(const saved of [false,true]){
   const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});
   if(saved)await context.addInitScript(()=>localStorage.setItem('dacha3v2',JSON.stringify({who:'girl',visitorName:'QA',level:2,lives:4,stars:7,bought:[]})));
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('file://'+file);
   await page.locator('#spPlay').waitFor({state:'visible',timeout:12000});
   assert.match(await page.locator('.beta-splash-name').innerText(),/Бабушкина[\s\S]*дача 2\.0/);
   assert.match(await page.locator('#betaSplashGreeting').innerText(),/Муся и Доня/);
   assert.equal(await page.locator('#spContinue').isVisible(),saved);
   assert.equal(await page.locator('#splash .sp-dev').innerText(),'Разработчик: Никита Гусев');
   const buttons=await page.locator('#splash .beta-splash-tools button').count();assert.equal(buttons,3);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);assert.equal(overflow,false);
   const art=await page.locator('.beta-splash-art').evaluate(el=>getComputedStyle(el).backgroundImage);
   assert.match(art,/data:image\/webp/);
   assert.equal(await page.locator('#granny svg.marina-rig').count(),0);
   await page.screenshot({path:path.join(out,'splash-'+width+'x'+height+'-'+(saved?'returning':'first')+'.png')});
   await page.locator('#spLetter').click();
   assert.match(await page.locator('#betaLetterBody').innerText(),/Дорогая бабушка Марина/);
   await page.locator('#betaLetterClose').click();
   await page.locator('#spSettings').click();
   assert.equal(await page.locator('#betaSettingsClose').isVisible(),true);
   await page.locator('#betaSettingsClose').click();
   await page.locator('#spMusic').click();await page.locator('#spSound').click();
   if(saved){await page.locator('#spContinue').click();}else{await page.locator('#spPlay').click();}
   await page.waitForTimeout(650);
   assert.equal(await page.locator('#splash').isHidden(),true);
   if(!saved)assert.equal(await page.locator('#whoBoy').isVisible(),true);
   assert.deepEqual(errors,[],'Page JS errors');
   console.log('PASS splash '+width+'x'+height+' saved='+saved);
   await context.close();
  }
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
