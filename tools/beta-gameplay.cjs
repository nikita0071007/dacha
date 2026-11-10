const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.argv[3]||'beta/verify-out');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,args:['--no-sandbox']});
for(const [w,h] of [[360,640],[390,800],[412,915]]){
 const context=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:1});
 await context.addInitScript(()=>localStorage.setItem('dacha3v2',JSON.stringify({who:'girl',level:50,lives:5,stars:0,pets:['cat','dog'],infUntil:Date.now()+1e10})));
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('file://'+path.resolve(process.argv[2]||'beta/index.html'));await p.locator('#spPlay').click();
 await p.evaluate(()=>{try{closeModal()}catch(e){};renderHome();});
 await p.screenshot({path:path.join(out,w+'x'+h+'-marina-front.png')});
 let poses=await p.evaluate(()=>{
  const el=document.querySelector('#granny'),rig=el.querySelector('.marina-rig');
  if(!rig)throw Error('animated Marina not found');
  const modes=[];
  for(const [x,y] of [[50,78],[35,77],[55,77]]){el.classList.add('walk');placeGranny(x,y);modes.push({x,y,left:el.classList.contains('left'),gf:window.getComputedStyle(el.querySelector('.gf')).transform});}
  return modes;
 });
 assert.equal(poses[1].left,true);assert.equal(poses[2].left,false);
 assert.equal(poses[1].gf,'none','no mirrored flat image');
 await p.screenshot({path:path.join(out,w+'x'+h+'-marina-side.png')});
 await p.evaluate(()=>{document.querySelector('#granny').classList.remove('walk');startLevel(0);try{closeModal()}catch(e){};G.busy=false;});
 let before=await p.evaluate(()=>G.moves);
 const step=await p.evaluate(async()=>{
  const B=G.board;
  for(let r=0;r<N;r++)for(let c=0;c<N;c++)for(const [dr,dc] of [[0,1],[1,0]]){
   let y=r+dr,x=c+dc;if(y>=N||x>=N)continue;
   if(!B[r][c]||!B[y][x]||isBox(B[r][c])||isBox(B[y][x]))continue;
   swapIn(B,r,c,y,x);const match=findRuns(B).length>0;swapIn(B,y,x,r,c);
   if(match){await onTap([r,c]);await onTap([y,x]);return {from:[r,c],to:[y,x]};}
  }
  throw Error('No valid swap at level 1');
 });
 await p.waitForTimeout(1100);
 const after=await p.evaluate(()=>G.moves);
 assert.ok(after<before,'real move must consume turns; before '+before+' after '+after);
 const piece=await p.evaluate(()=>({harvest:document.documentElement.dataset.harvest,pieces:TYPES}));
 assert.equal(piece.harvest,'vegetable');
 assert.deepEqual(piece.pieces,['🍅','🥕','🥒','🥬','🫑','🫜']);
 await p.screenshot({path:path.join(out,w+'x'+h+'-played-vegetables.png')});
 assert.deepEqual(errors,[],'page errors');
 console.log('PASS player flow '+w+'x'+h+' move '+JSON.stringify(step)+' moves '+before+'->'+after);
 await context.close();
}
await b.close();})().catch(e=>{console.error(e);process.exit(1)});
