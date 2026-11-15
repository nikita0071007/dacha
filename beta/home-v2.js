/* Point B — approved photo backgrounds and independently displayed repair states.
   No changes to S, save(), level rules or construction cost. */
(function(){
 'use strict';
 const home=document.getElementById('home'),scene=document.getElementById('scene');
 if(!home||!scene)return;
 const fenceLayer=document.createElement('div');
 fenceLayer.className='beta-fence-layer';
 fenceLayer.setAttribute('aria-hidden','true');
 home.insertBefore(fenceLayer,home.firstChild);
 const status=document.createElement('div');status.className='beta-build-status';
 status.innerHTML='<button type="button" id="betaHouseStage" aria-label="Ремонт дома"></button><button type="button" id="betaFenceStage" aria-label="Ремонт забора"></button>';
 scene.insertAdjacentElement('afterend',status);
 const houseButton=document.getElementById('betaHouseStage'),fenceButton=document.getElementById('betaFenceStage');
 const statusUpdate=()=>{
   const hs=houseStage(),fs=fenceStage();
   const houseState=hs<2?'ruined':hs<4?'half':'ready';
   const fenceState=fs<2?'ruined':fs<4?'half':'ready';
   home.dataset.betaHouse=houseState;
   home.dataset.betaFence=fenceState;
   houseButton.textContent='🏠 Дом · '+hs+'/5';
   fenceButton.textContent='🪵 Забор · '+fs+'/4';
   houseButton.title=HOUSE_STAGES[hs].n;
   fenceButton.title=FENCE_STAGES[fs].n;
   const current=currentTask();
   houseButton.disabled=hs>=5||(!S.bought.includes('house')&&current?.id!=='house');
   fenceButton.disabled=fs>=4||(!S.bought.includes('fence')&&current?.id!=='fence');
   home.dataset.betaSceneReady='true';
 };
 const act=(kind)=>{
   const target=scene.querySelector('.it[data-item="'+kind+'"]');
   if(target?.onclick)target.click();
   else if(currentTask()?.id===kind)buildTask();
 };
 houseButton.addEventListener('click',()=>act('house'));
 fenceButton.addEventListener('click',()=>act('fence'));
 const originalRenderHome=renderHome;
 renderHome=function(...args){const res=originalRenderHome(...args);statusUpdate();return res;};
 statusUpdate();
 window.betaHomeSnapshot=()=>({house:houseStage(),fence:fenceStage(),houseVisual:home.dataset.betaHouse,fenceVisual:home.dataset.betaFence,stars:S.stars,bought:S.bought.slice()});
})();
