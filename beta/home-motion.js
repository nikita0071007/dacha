/* Animated menu layer only. Existing buildTask, costs, saves and game state stay intact. */
(function(){
 'use strict';
 const task=document.getElementById('task');if(!task)return;
 const original=renderTask;
 const refresh=()=>{
  task.classList.add('beta-garden-task');
  let title=task.querySelector('.beta-task-heading');
  if(!title){title=document.createElement('div');title.className='beta-task-heading';task.prepend(title);}
  title.textContent='Дела на даче';
  const count=document.createElement('small');count.textContent=S.bought.length+' из '+ITEMS.length;title.append(count);
  const build=task.querySelector('#buildBtn'),t=currentTask();
  if(build&&t)build.setAttribute('aria-label',t.n+': '+build.textContent.trim());
 };
 renderTask=function(...args){const res=original.apply(this,args);refresh();return res;};
 refresh();
 const selector='#home #playBtn,#home .beta-repair-button,#home #task .tb,#home #levels .lv,.top .chip,.garden-styles button';
 document.addEventListener('pointerdown',e=>{
  const el=e.target.closest?.(selector);if(el&&!el.disabled)el.classList.add('beta-tapped');
 },{passive:true});
 for(const event of ['pointerup','pointercancel','pointerleave'])document.addEventListener(event,e=>{
  const el=e.target.closest?.(selector);if(el)setTimeout(()=>el.classList.remove('beta-tapped'),120);
 },{passive:true});
 window.BetaHomeMotion={refresh,version:'B-menu-motion'};
})();
