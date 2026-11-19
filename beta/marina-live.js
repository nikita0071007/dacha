/* Marina live (beta). Hop-on-tap and optional sprite-sheet walk. Uses the approved Marina art only.
   Sprite sheet (optional): window.MARINA_WALK_SHEET = {src, frames, frameW, frameH, fps}; frames in one row, facing right. */
(function(){
 'use strict';
 var hopTimer=null, idleH=0;
 function G(){return document.getElementById('granny');}
 document.addEventListener('click',function(e){
  var g=G(); if(!g||!e.target.closest||!e.target.closest('#granny')) return;
  g.classList.remove('ml-hop'); void g.offsetWidth; g.classList.add('ml-hop');
  clearTimeout(hopTimer); hopTimer=setTimeout(function(){g.classList.remove('ml-hop');},600);
  if(typeof window.marinaPose==='function') window.marinaPose('marina-wave',1800);
 },true);
 function measure(){ /* remember the idle sprite height so the walking sprite matches it */
  var g=G(); if(!g) return; var img=g.querySelector('.mimg'); if(!img) return;
  var h=img.getBoundingClientRect().height; if(h>20&&h!==idleH){idleH=h; layout();}
 }
 function layout(){
  var s=window.MARINA_WALK_SHEET, g=G(); if(!s||!g||!idleH) return;
  var d=g.querySelector('.ml-sheet'); if(!d) return;
  var k=idleH/s.frameH, w=s.frameW*k;
  d.style.width=w+'px'; d.style.height=idleH+'px';
  d.style.backgroundSize=(w*s.frames)+'px '+idleH+'px';
  d.style.setProperty('--ml-sheet-w',(-w*s.frames)+'px');
 }
 function buildSheet(){
  var s=window.MARINA_WALK_SHEET, g=G(); if(!s||!s.src||!s.frames||!g) return;
  var holder=g.querySelector('.gf'); if(!holder) return;
  var d=holder.querySelector('.ml-sheet');
  if(!d){
   d=document.createElement('div'); d.className='ml-sheet';
   d.style.backgroundImage='url('+s.src+')';
   d.style.animation='mlSheet '+(s.frames/(s.fps||10))+'s steps('+s.frames+') infinite';
   holder.appendChild(d); g.classList.add('ml-has-sheet');
  }
  measure(); layout();
 }
 window.marinaLiveReady=true; window.marinaLiveSheet=buildSheet;
 buildSheet(); setInterval(function(){buildSheet();},1500);
 window.addEventListener('resize',function(){idleH=0;measure();});
})();
