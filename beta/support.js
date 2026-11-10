/* ШАГ 4 — добровольная поддержка. Менять URL только здесь. */
const SUPPORT_URL = '';
const SUPPORT_IN_ANDROID = false; // RuStore: только отдельное обновление после проверки требований магазина.
(function(){
  'use strict';
  const button=document.getElementById('supportBtn');
  if(!button)return;
  const android=/Android/i.test(navigator.userAgent);
  const enabled=/^https:\/\//i.test(SUPPORT_URL) && (!android||SUPPORT_IN_ANDROID);
  button.hidden=!enabled;
  if(!enabled)return;
  button.setAttribute('aria-label','Поддержать автора добровольно');
  button.onclick=()=>{
    openModal('<h2>💛 Поддержать автора</h2><p>Игра бесплатная. Если нравится, можно поддержать автора любой суммой. Это добровольно и ничего в игре не меняет.</p><button class="btn alt" id="betaSupportPay" type="button">Перейти к оплате через СБП</button><button class="btn ghost" type="button" id="betaSupportClose">Закрыть</button>');
    document.getElementById('betaSupportPay').onclick=()=>window.open(SUPPORT_URL,'_blank','noopener,noreferrer');
    document.getElementById('betaSupportClose').onclick=closeModal;
  };
})();
