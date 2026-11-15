/* Beta 2.0 / Point B: presentation only, existing construction logic is untouched.
   APPROVED artwork: embedded IM.home (set as --art-home-ready in beta/index.html).
   Ruined/half images supplied by Nikita are awaiting a verified binary GitHub upload.
   Do not claim a visual repair state is shown until its offline asset is present. */
(function () {
  'use strict';
  const home = document.getElementById('home');
  const scene = document.getElementById('scene');
  if (!home || !scene) return;
  home.classList.add('beta-home-v2');
  home.querySelector('.title').textContent = 'Бабушкина дача 2.0';
  const banner = document.createElement('div');
  banner.className = 'beta-home-banner';
  banner.innerHTML = '<span class="beta-home-banner-leaf" aria-hidden="true">🌼</span><strong>Бабушкина<br>дача 2.0</strong><span class="beta-home-banner-leaf" aria-hidden="true">🌼</span>';
  scene.insertAdjacentElement('beforebegin',banner);
  const status = document.createElement('div');
  status.className = 'beta-repair-status';
  status.innerHTML =
    '<button type="button" id="betaHouseUpgrade" class="beta-repair-button" aria-label="Этапы ремонта дома"></button>'+
    '<button type="button" id="betaFenceUpgrade" class="beta-repair-button" aria-label="Этапы ремонта забора"></button>';
  scene.insertAdjacentElement('afterend',status);
  const houseButton = document.getElementById('betaHouseUpgrade');
  const fenceButton = document.getElementById('betaFenceUpgrade');
  const originalRenderHome = renderHome;
  const safe = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function refresh() {
    const house = houseStage(), fence = fenceStage();
    scene.dataset.houseStage = String(house);
    scene.dataset.fenceStage = String(fence);
    const ownsHouse=S.bought.includes('house'),ownsFence=S.bought.includes('fence');
    houseButton.disabled=!ownsHouse||house>=5;
    fenceButton.disabled=!ownsFence||fence>=4;
    const houseNext=HOUSE_STAGES[Math.min(house+1,5)];
    const fenceNext=FENCE_STAGES[Math.min(fence+1,4)];
    houseButton.innerHTML = '<span aria-hidden="true">🏠</span><span>Дом <b>'+house+'/5</b><small>'+(ownsHouse?(house>=5?'Готов!':safe(houseNext.n)+' · ⭐'+houseNext.c):'Стройка по заданию')+'</small></span>';
    fenceButton.innerHTML = '<span aria-hidden="true">🪵</span><span>Забор <b>'+fence+'/4</b><small>'+(ownsFence?(fence>=4?'Готов!':safe(fenceNext.n)+' · ⭐'+fenceNext.c):'Стройка по заданию')+'</small></span>';
    // Construction stages are independent; never derive either stage from the other.
    // Final background is approved; two earlier states require image assets (no
    // CSS/SVG-drawn replacement buildings or misaligned image crossfades).
    scene.dataset.stageArt = 'ready-only';
  }
  houseButton.onclick = () => {if (!houseButton.disabled) renovateHouse();};
  fenceButton.onclick = () => {if (!fenceButton.disabled) renovateFence();};
  renderHome = function(...args) {
    const value=originalRenderHome.apply(this,args);
    refresh();
    return value;
  };
  refresh();
  window.BetaHomeV2 = Object.freeze({refresh,version:'B-preview',hasStageAssets:false});
})();
