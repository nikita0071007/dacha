const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
for(const pets of [[],['cat'],['dog'],['cat','dog']]){
 const context=await browser.newContext({viewport:{width:390,height:800}});
 await context.addInitScript((pets)=>localStorage.setItem('dacha3v2',JSON.stringify({who:'girl',visitorName:'QA',pets,level:1,lives:5,stars:0})),pets);
 const page=await context.newPage(),errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(process.argv[2]||'beta/index.html'));await page.locator('#spPlay').click();
 await page.evaluate(()=>{try{closeModal()}catch(e){};petModal();});
 const body=await page.locator('#sheet').innerText();
 assert.match(body,/Муся/); assert.match(body,/Доня/);
 assert.doesNotMatch(body,/Мурка|Шарик|Пёс Шарик/);
 const state=await page.evaluate(()=>({pets:S.pets.slice(),names:[PETS.cat.n,PETS.dog.n],buy:[PETS.cat.buy,PETS.dog.buy]}));
 assert.deepEqual(state.pets,pets,'existing selection must remain untouched');
 assert.match(state.names[0],/кошка Муся/);assert.match(state.names[1],/Доня/);
 assert.match(state.buy[1],/Доня/);
 assert.equal(await page.locator('#pk_cat').isDisabled(),pets.includes('cat'));
 assert.equal(await page.locator('#pk_dog').isDisabled(),pets.includes('dog'));
 assert.deepEqual(errors,[]);
 await context.close();console.log('PASS pet labels and existing choice for '+JSON.stringify(pets));
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
