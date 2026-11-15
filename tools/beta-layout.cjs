const {chromium}=require('playwright');
const path=require('path'),fs=require('fs');const file=path.resolve(process.argv[2]||'beta/index.html'),output=path.resolve(process.argv[3]||'beta/verify-out');fs.mkdirSync(output,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const measured=[];
for(const [width,height] of [[360,640],[390,800],[412,915]]){
 const ctx=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
 await ctx.addInitScript(()=>localStorage.setItem('dacha3v2',JSON.stringify({who:'girl',visitorName:'QA',pets:['cat','dog'],stars:0,level:0})));
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+file);await page.locator('#spPlay').click();await page.waitForTimeout(350);
 await page.evaluate(()=>{try{closeModal()}catch(e){};renderHome();});
 const m=await page.evaluate(()=>{
  const rect=q=>{const e=document.querySelector(q);if(!e)return null;const r=e.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)};};
  return {home:rect('#home'),scene:rect('#scene'),marina:rect('#scene #granny img.mimg'),cat:rect('#scene .it.pet.cat .pimg'),dog:rect('#scene .it.pet.dog .pimg'),image:document.querySelector('#home').dataset.betaHouse,scrollWidth:document.documentElement.scrollWidth,innerWidth};
 });
 const ok=m.home&&m.scene&&m.marina?.h>=60&&m.cat?.h>=30&&m.dog?.h>m.cat?.h&&m.scene.h>=160&&m.image==='ruined'&&m.scrollWidth<=width+2&&errors.length===0;
 await page.screenshot({path:path.join(output,width+'x'+height+'-beta-garden.png')});
 measured.push({viewport:width+'x'+height,ok:!!ok,...m,errors});await ctx.close();
}
await browser.close();fs.writeFileSync(path.join(output,'proportions.json'),JSON.stringify(measured,null,2));
measured.forEach(m=>console.log((m.ok?'PASS':'FAIL')+' '+m.viewport+' background '+m.image+' Marina '+m.marina?.h+' cat '+m.cat?.h+' dog '+m.dog?.h));
if(measured.some(m=>!m.ok))process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
