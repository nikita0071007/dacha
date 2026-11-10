const { chromium } = require('playwright');
const fs=require('fs'),path=require('path');
const file=path.resolve(process.argv[2]||'beta/index.html');
const out=path.resolve(process.argv[3]||'beta/verify-out');
fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:800},reducedMotion:'reduce'});
await page.addInitScript(()=>localStorage.setItem('dacha3v2',JSON.stringify({who:'boy',visitorName:'QA',level:50,stars:0,lives:5,infUntil:Date.now()+3600000000,dLast:new Date().toISOString().slice(0,10)})));
await page.goto('file://'+file);
await page.locator('#spPlay').click();
await page.waitForTimeout(450);
const items=[];
for(const level of [1,10,11,20,21,30,31,40,41,50]){
  const status=await page.evaluate(n=>{
    if(typeof closeModal==='function')closeModal();
    G=null;startLevel(n-1);
    return {level:n,kind:document.documentElement.dataset.harvest,
      pieces:TYPES.slice(),allSvg:VEG.every(v=>v.includes('<svg')),
      boxCount:G.board.flat().filter(t=>t.s==='box').length,
      hasMove:hasMove(G.board),runs:findRuns(G.board).length,
      intro:document.querySelector('#sheet')?.textContent?.slice(0,200)};
  },level);
  const expected=Math.floor((level-1)/10)%2===0?'vegetable':'fruit';
  if(status.kind!==expected || !status.allSvg || status.runs!==0 || !status.hasMove)
     throw Error('Invalid harvest level '+level+': '+JSON.stringify(status));
  if(level===11 || level===21 || level===31 || level===41){
     if(!status.intro.includes('Теперь собираем'))throw Error('Missing block introduction '+level);
     await page.screenshot({path:path.join(out,'harvest-transition-'+level+'.png')});
  }
  if(level===10||level===11||level===20||level===21){
    await page.evaluate(()=>{document.getElementById('nextHarvest')?.click();closeModal();G.busy=false;});
    await page.screenshot({path:path.join(out,'harvest-board-'+level+'.png')});
  }
  items.push(status);
}
fs.writeFileSync(path.join(out,'harvest-sets.json'),JSON.stringify(items,null,2));
console.log('PASS alternating sets, 4 transitions, 10 sampled boards');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
