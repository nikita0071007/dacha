const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const out=process.argv[3]||'';
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
for(const [w,h] of [[360,640],[390,800],[412,915]]){
 const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});
 await context.addInitScript(()=>localStorage.setItem('dacha3v2',JSON.stringify({who:'girl',visitorName:'QA',pets:['cat','dog'],level:1,lives:5,stars:0})));
 const page=await context.newPage(),errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(process.argv[2]||'beta/index.html'));await page.locator('#spPlay').click();
 await page.evaluate(()=>{try{closeModal()}catch(e){}});
 await page.waitForTimeout(800);
 assert.equal(await page.evaluate(()=>window.marinaLiveReady),true,'marina-live loaded');
 const idle=await page.evaluate(()=>getComputedStyle(document.querySelector('#granny .mimg')).animationName);
 assert.match(idle,/mlBreathe/,'idle breathing animation active');
 const shadow=await page.evaluate(()=>getComputedStyle(document.querySelector('#granny .gf'),'::before').content);
 assert.notEqual(shadow,'none','ground shadow present');
 await page.evaluate(()=>document.getElementById('granny').classList.add('walk'));
 await page.waitForTimeout(200);
 await page.waitForTimeout(1700);
 const sh=await page.evaluate(()=>{const d=document.querySelector('#granny .ml-sheet');const i=document.querySelector('#granny .mimg');return d?{disp:getComputedStyle(d).display,w:d.getBoundingClientRect().width,h:d.getBoundingClientRect().height,anim:getComputedStyle(d).animationName,img:getComputedStyle(i).display,bg:getComputedStyle(d).backgroundImage}:null});
 assert.ok(sh,'sprite sheet element built');
 assert.equal(sh.disp,'block','walk sheet shown while walking');
 assert.equal(sh.img,'none','still image hidden while sheet plays');
 assert.ok(sh.w>20&&sh.h>40,'sheet has size '+JSON.stringify(sh));
 assert.match(sh.anim,/mlSheet/,'sheet animation runs');
 assert.match(sh.bg,/marina-walk/,'sheet image set');
 await page.evaluate(()=>document.getElementById('granny').classList.remove('walk'));
 await page.evaluate(()=>document.getElementById('granny').click());
 await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>document.getElementById('granny').classList.contains('ml-hop')),true,'tap hop');
 const flat=await page.evaluate(()=>{const i=document.querySelector('#granny .mimg').getBoundingClientRect();return [i.width,i.height]});
 assert.ok(flat[1]>40,'Marina visible, height '+flat[1]);
 if(out){await page.screenshot({path:`${out}/marina-live-${w}x${h}.png`});}
 assert.deepEqual(errors,[]);
 await context.close();console.log(`PASS marina-live ${w}x${h}`);
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
