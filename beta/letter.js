/* ШАГ 2 — Письмо от Никиты. Меняйте только значение переменной ниже. */
const NIKITA_LETTER = `Дорогая бабушка Марина Борисовна!

Я твой внук Никита. Мне очень хотелось подарить тебе немного радости — так родилась эта игра. Здесь наша дача, любимые Муся и Доня и тёплые воспоминания о детстве рядом с тобой.

Я посвящаю эту игру тебе и буду бережно делать её лучше.

С любовью, твой внук Никита.`;
(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const showLetter = () => {
    openModal('<div class="beta-letter" role="document"><div class="beta-letter-deco" aria-hidden="true">🌷 ✉️ 🌷</div><h2 id="betaLetterTitle">Письмо от Никиты</h2><p class="beta-letter-body" id="betaLetterBody"></p><button type="button" class="btn" id="betaLetterClose">Закрыть</button></div>');
    $('#sheet').setAttribute('aria-labelledby', 'betaLetterTitle');
    $('#betaLetterBody').textContent = NIKITA_LETTER;
    $('#betaLetterClose').onclick = () => {closeModal(); $('#sheet').removeAttribute('aria-labelledby');};
    $('#betaLetterClose').focus();
  };
  const showSettings = () => {
    openModal('<div class="beta-info-menu"><h2>⚙️ Настройки</h2><p>Музыка и звуки настраиваются кнопками в верхней панели.</p><p>Музыка: мягкий WebAudio-синтез, не живая запись. Послушать:</p><div class="beta-music-samples"><button type="button" id="sampleSplash">Заставка</button><button type="button" id="sampleHome">Дача</button><button type="button" id="sampleLevel">Уровень</button><button type="button" id="sampleVictory">Победа</button></div><button type="button" class="btn alt" id="betaSettingsLetter">✉️ Письмо от Никиты</button><button type="button" class="btn" id="betaSettingsClose">Закрыть</button></div>');
    [['sampleSplash','splash'],['sampleHome','home'],['sampleLevel','level'],['sampleVictory','victory']].forEach(([id,name])=>{$('#'+id).onclick=()=>window.BetaMusic.preview(name);});
    $('#betaSettingsLetter').onclick = showLetter;
    $('#betaSettingsClose').onclick = closeModal;
    $('#betaSettingsLetter').focus();
  };
  const showAbout = () => {
    openModal('<div class="beta-info-menu"><h2>🌼 Об игре</h2><p>«Бабушкина дача» — семейная игра про урожай, любимых животных и счастливые воспоминания. С любовью создана внуком Никитой для бабушки Марины Борисовны.</p><button type="button" class="btn alt" id="betaAboutLetter">✉️ Письмо от Никиты</button><button type="button" class="btn" id="betaAboutClose">Закрыть</button></div>');
    $('#betaAboutLetter').onclick = showLetter;
    $('#betaAboutClose').onclick = closeModal;
    $('#betaAboutLetter').focus();
  };
  $('#betaSettingsBtn').addEventListener('click', showSettings);
  $('#betaAboutBtn').addEventListener('click', showAbout);
})();
