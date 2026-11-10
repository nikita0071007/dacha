const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{const source=fs.readFileSync(path.resolve(process.argv[2]||'beta/support.js'),'utf8');
assert.match(source,/const SUPPORT_URL = ''/);assert.match(source,/SUPPORT_IN_ANDROID = false/);
const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage();
const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+path.resolve('beta/index.html'));
assert.equal(await p.locator('#supportBtn').isHidden(),true);
assert.equal(await p.evaluate(()=>typeof SUPPORT_URL==='string'&&SUPPORT_URL===''),true);
assert.equal(errors.length,0,errors.join('; '));console.log('PASS: no payment link, support hidden, no page errors');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});