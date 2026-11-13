const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=path.resolve(process.argv[2]||'beta/index.html'),output=path.resolve(process.argv[3]||'beta/verify-out');
fs.mkdirSync(output,{recursive:true});
const text=fs.readFileSync(html,'utf8');
assert.match(text,/<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">/);
assert.doesNotMatch(text,/<script[^>]+src=["']https?:\/\//);
assert.doesNotMatch(text,/fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com\/\@vkontakte/);
const support=fs.readFileSync(path.resolve('beta/support.js'),'utf8');
assert.match(support,/const SUPPORT_URL = ''/);
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
for(const [width,height] of [[360,640],[390,800],[412,915]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
 await context.addInitScript(()=>localStorage.setItem('dacha3v2',JSON.stringify({who:'girl',visitorName:'QA',level:1,lives:5,stars:0})));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+html);
 await page.locator('#spPlay').waitFor({state:'visible',timeout:12000});
 const measure=()=>page.evaluate(()=>({scale:visualViewport?.scale||1,x:scrollX,y:scrollY,scrollWidth:document.documentElement.scrollWidth,innerWidth,bodyOverflow:getComputedStyle(document.body).overflow,htmlOverflow:getComputedStyle(document.documentElement).overflow,top:parseFloat(getComputedStyle(document.body).paddingTop),bottom:parseFloat(getComputedStyle(document.body).paddingBottom)}));
 let m=await measure();
 assert.equal(m.scale,1);assert.equal(m.bodyOverflow,'hidden');assert.equal(m.htmlOverflow,'hidden');
 assert.ok(m.scrollWidth<=width+2,'horizontal overflow: '+JSON.stringify(m));
 await page.screenshot({path:path.join(output,'screen-lock-'+width+'x'+height+'-splash.png')});
 // Simulate pinch on a mobile viewport. Browser must not zoom or pan the document.
 const cdp=await context.newCDPSession(page);
 await cdp.send('Input.synthesizePinchGesture',{x:Math.round(width/2),y:Math.round(height/2),scaleFactor:1.6,relativeSpeed:600});
 await page.waitForTimeout(150);
 let p=await measure();assert.ok(Math.abs(p.scale-1)<.01,'pinch zoomed: '+JSON.stringify(p));assert.equal(p.x,0);assert.equal(p.y,0);
 await page.locator('#spPlay').click();
 await page.evaluate(()=>{try{closeModal()}catch(e){}});
 await page.locator('#playBtn').click();
 await page.evaluate(()=>{try{closeModal()}catch(e){}});
 await page.screenshot({path:path.join(output,'screen-lock-'+width+'x'+height+'-level.png')});
 m=await measure();assert.equal(m.x,0);assert.equal(m.y,0);assert.ok(m.scrollWidth<=width+2);
 assert.deepEqual(errors,[],errors.join('; '));
 console.log('PASS point A viewport '+width+'x'+height+' pinch=1, document fixed, no external resources');
 await context.close();
}
await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
