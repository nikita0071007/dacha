/* Marina live (beta). Adds hop-on-tap and optional sprite-sheet walk. Uses the approved Marina sprite only.
   Sprite sheet (optional): window.MARINA_WALK_SHEET = {src, frames, frameW, frameH, fps}  (frames in one row, facing right). */
(function(){
 'use strict';
 var hopTimer=null;
 function G(){return document.getElementById('granny');}
 document.addEventListener('click',function(e){
  var g=G(); if(!g||!e.target.closest||!e.target.closest('#granny')) return;
  g.classList.remove('ml-hop'); void g.offsetWidth; g.classList.add('ml-hop');
  clearTimeout(hopTimer); hopTimer=setTimeout(function(){g.classList.remove('ml-hop');},600);
  if(typeof window.marinaPose==='function') window.marinaPose('marina-wave',1800);
 },true);
 function buildSheet(){
  var s=window.MARINA_WALK_SHEET; if(!s||!s.src||!s.frames) return;
  var g=G(); if(!g) return;
  var holder=g.querySelector('.gf'); if(!holder||holder.querySelector('.ml-sheet')) return;
  var d=document.createElement('div'); d.className='ml-sheet';
  var img=g.querySelector('.mimg'); var h=img&&img.getBoundingClientRect().height||s.frameH;
  var k=h/s.frameH, w=s.frameW*k;
  d.style.cssText='width:'+w+'px;height:'+h+'px;background-image:url('+s.src+');background-size:'+(w*s.frames)+'px '+h+'px;'+
   '--ml-sheet-w:'+(-w*s.frames)+'px;animation:mlSheet '+(s.frames/(s.fps||10))+'s steps('+s.frames+') infinite';
  holder.appendChild(d); g.classList.add('ml-has-sheet');
 }
 window.marinaLiveReady=true;
 window.marinaLiveSheet=buildSheet;
 if(window.MARINA_WALK_SHEET) buildSheet();
})();
