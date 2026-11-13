/* Beta 2.0 — The author can edit this greeting without touching game logic. */
const BETA_SPLASH_GREETING = 'Добро пожаловать на дачу! Здесь тебя ждут Марина, Муся и Доня. Собирай овощи и помогай по хозяйству.';
(function(){
  'use strict';
  const byId=id=>document.getElementById(id), welcome=byId('betaSplashGreeting');
  if(!welcome)return;
  welcome.textContent=BETA_SPLASH_GREETING;
  // A default empty save is written on boot: only genuine player progress counts.
  const hasSave=()=>Boolean((S.who==='girl'||S.who==='boy')||S.level>0||S.bought.length||S.best.some(n=>n>0));
  const continueButton=byId('spContinue'),startButton=byId('spPlay'),splash=byId('splash'),modal=byId('modal');
  continueButton.hidden=!hasSave();
  continueButton.onclick=()=>{if(!startButton.hidden&&hasSave())startButton.click();};
  const show=fn=>{splash.classList.add('beta-dialog-on');fn();};
  new MutationObserver(()=>{if(modal.hidden)splash.classList.remove('beta-dialog-on');}).observe(modal,{attributes:true,attributeFilter:['hidden']});
  byId('spLetter').onclick=()=>{if(typeof window.openBetaLetter==='function')show(window.openBetaLetter);};
  byId('spSettings').onclick=()=>show(()=>byId('betaSettingsBtn').click());
  byId('spMusic').onclick=()=>byId('musicBtn').click();
  byId('spSound').onclick=()=>byId('soundBtn').click();
  const mirror=()=>{
    for(const [srcId,dstId] of [['musicBtn','spMusic'],['soundBtn','spSound']]){
      const src=byId(srcId),dst=byId(dstId),pressed=src.getAttribute('aria-pressed');
      if(pressed!==null)dst.setAttribute('aria-pressed',pressed);
      dst.classList.toggle('off',src.classList.contains('off'));
    }
  };
  for(const id of ['musicBtn','soundBtn'])
    new MutationObserver(mirror).observe(byId(id),{attributes:true,attributeFilter:['class','aria-pressed']});
  mirror();
  startButton.addEventListener('click',()=>{
    splash.classList.remove('beta-dialog-on');
    // The original first-visit modal opens behind the splash. Restore it if
    // the player opened the letter/settings before choosing a role.
    if(!S.who)setTimeout(()=>{if(modal.hidden)whoModal();},520);
  });
  window.refreshBetaSplash=()=>{continueButton.hidden=!hasSave();mirror();};
})();
