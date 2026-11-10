const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = path.resolve(process.argv[2] || 'beta/index.html');
const output = path.resolve(process.argv[3] || 'beta/verify-out');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless:true, args:['--no-sandbox'] });
  const measured = [];
  for(const [width,height] of [[360,640],[390,800],[412,915]]){
    const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
    await context.addInitScript(() => localStorage.setItem('dacha3v2',JSON.stringify({who:'boy',visitorName:'Тест',pets:['cat','dog'],stars:0,level:0})));
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('file://'+file);
    await page.locator('#spPlay').click();
    await page.waitForTimeout(600);
    await page.evaluate(()=>{try{closeModal()}catch(e){};renderHome();});
    const metrics=await page.evaluate(()=>{
      const rect=q=>{const e=document.querySelector(q);if(!e)return null;const r=e.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)};};
      const house=rect('#scene .it[data-item="house"] svg'), marina=rect('#scene #granny .mimg'), cat=rect('#scene .it.pet.cat .pimg'),dog=rect('#scene .it.pet.dog .pimg');
      return {house,marina,cat,dog,scene:rect('#scene'),scrollWidth:document.documentElement.scrollWidth,innerWidth,estimatedDoorHeight:house?house.h*25/76:null};
    });
    const ok=metrics.house&&metrics.marina&&metrics.cat&&metrics.dog&&
      metrics.marina.h/metrics.estimatedDoorHeight>=.35&&metrics.marina.h/metrics.estimatedDoorHeight<=.75&&
      metrics.cat.h/metrics.marina.h>=.35&&metrics.cat.h/metrics.marina.h<=.7&&
      metrics.dog.h>metrics.cat.h&&metrics.dog.h<metrics.cat.h*1.5&&
      metrics.house.w<width*.95&&metrics.scrollWidth<=width+2&&!errors.length;
    await page.screenshot({path:path.join(output,width+'x'+height+'-beta-garden.png'),fullPage:true});
    measured.push({viewport:width+'x'+height,ok:!!ok,...metrics,errors});
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(output,'proportions.json'),JSON.stringify(measured,null,2));
  measured.forEach(m=>console.log((m.ok?'PASS':'FAIL')+' '+m.viewport+
   ' house '+(m.house?.w||0)+'x'+(m.house?.h||0)+
   ' Marina '+(m.marina?.h||0)+' cat '+(m.cat?.h||0)+' dog '+(m.dog?.h||0)));
  if(measured.some(m=>!m.ok))process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
