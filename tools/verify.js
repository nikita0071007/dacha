// Проверка «Бабушкиной дачи». Запуск: node verify.js <index.html> [уровней=50] [папка-для-скриншотов]
// Playwright: PW=/opt/npm-tools/node_modules/playwright (или обычный require('playwright'))
const fs = require('fs'), path = require('path'), vm = require('vm');
let chromium; try { ({ chromium } = require(process.env.PW || '/opt/npm-tools/node_modules/playwright')); } catch (e) { ({ chromium } = require('playwright')); }
const file = path.resolve(process.argv[2] || 'index.html');
const LEVELS = +(process.argv[3] || 50);
const OUT = path.resolve(process.argv[4] || 'verify-out');
fs.mkdirSync(OUT, { recursive: true });
const R = []; const add = (ok, name, note = '') => { R.push({ ok, name, note }); console.log((ok === true ? 'OK   ' : ok === false ? 'FAIL ' : 'WARN ') + name + (note ? ' — ' + note : '')); };
const src = fs.readFileSync(file, 'utf8');

(async () => {
  // 1. размер и синтаксис
  const kb = Math.round(Buffer.byteLength(src) / 1024);
  add(kb < 1500 ? true : null, 'Размер файла', kb + ' КБ');
  let synErr = 0; const re = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g; let m;
  while ((m = re.exec(src))) { try { new vm.Script(m[1]); } catch (e) { synErr++; add(false, 'Синтаксис JS', e.message); } }
  if (!synErr) add(true, 'Синтаксис JS', 'все встроенные скрипты разбираются');
  // 2. внешние ресурсы (должно работать без интернета)
  const ext = [...new Set([...src.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)["']/g)].map(x => x[1]))].filter(u => !/w3\.org/.test(u));
  add(ext.length === 0 ? true : null, 'Внешние ресурсы в разметке', ext.length ? ext.slice(0, 6).join(', ') + ' (для Android-офлайн это нужно убрать)' : 'нет');
  const fonts = /fonts\.googleapis|fonts\.gstatic/.test(src);
  add(fonts ? null : true, 'Шрифты Google', fonts ? 'подключены по сети' : 'нет');
  // 3. честность интерфейса
  const fake = [...src.matchAll(/(🪙|алмаз|кристалл|гемы|монет[аыу])/gi)].map(x => x[0]);
  add(fake.length ? null : true, 'Выдуманные монеты/валюта в коде', fake.length ? [...new Set(fake)].join(', ') : 'не найдено');
  const pay = /(createInvoice|openInvoice|yandex.*payments|GP\.payments|vkWebAppShowOrderBox|Stars)/i.test(src);
  add(null, 'Платёжный код в файле', pay ? 'найден: для RuStore-версии без платежей должен быть выключен' : 'не найден');

  const b = await chromium.launch();
  const sizes = [[390, 800], [360, 640], [412, 915]];
  let errs = [];
  // 4. скриншоты на трёх размерах + ошибки
  for (const [w, h] of sizes) {
    const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    await c.route(/fonts\.g|unpkg|telegram\.org|adsgram|vk\.com|vk-apps/, r => r.abort());
    const p = await c.newPage(); const e = [];
    p.on('pageerror', x => e.push(x.message));
    await p.goto('file://' + file); await p.waitForTimeout(2200);
    await p.screenshot({ path: `${OUT}/${w}x${h}-1-zastavka.png` });
    try { await p.click('#spPlay', { timeout: 4000 }); } catch (x) { e.push('нет кнопки «Играть» на заставке'); }
    await p.waitForTimeout(1200);
    for (let i = 0; i < 4; i++) { await p.evaluate(() => { try { closeModal(); } catch (x) {} }); await p.waitForTimeout(250); }
    await p.screenshot({ path: `${OUT}/${w}x${h}-2-glavnyj.png` });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
    if (overflow) e.push('горизонтальная прокрутка на ' + w + 'x' + h);
    await p.evaluate(() => { const bt = document.getElementById('playBtn'); bt && bt.click(); }); await p.waitForTimeout(1500);
    for (let i = 0; i < 3; i++) { await p.evaluate(() => { try { closeModal(); } catch (x) {} }); await p.waitForTimeout(250); }
    await p.screenshot({ path: `${OUT}/${w}x${h}-3-uroven.png` });
    const cut = await p.evaluate(() => { const bd = document.getElementById('board'); if (!bd) return 'нет поля'; const r = bd.getBoundingClientRect(); return (r.bottom > innerHeight || r.right > innerWidth || r.left < 0) ? 'поле выходит за экран' : ''; });
    if (cut) e.push(cut + ' на ' + w + 'x' + h);
    errs = errs.concat(e.map(x => `${w}x${h}: ${x}`)); await c.close();
  }
  add(errs.length === 0, 'Запуск и вёрстка на 3 размерах экрана', errs.length ? errs.slice(0, 5).join('; ') : 'ошибок нет, скриншоты в ' + OUT);

  // 5. старые сохранения
  {
    const c = await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
    await c.route(/fonts\.g|unpkg|telegram\.org|adsgram|vk\.com/, r => r.abort());
    await c.addInitScript(() => localStorage.setItem('dacha3v2', JSON.stringify({ who: 'girl', stars: 7, level: 12, lives: 3, bought: ['fence'], lv: { 1: 3, 2: 2 } })));
    const p = await c.newPage(); const e = []; p.on('pageerror', x => e.push(x.message));
    await p.goto('file://' + file); await p.waitForTimeout(2200);
    try { await p.click('#spPlay', { timeout: 4000 }); } catch (x) {}
    await p.waitForTimeout(1000);
    const st = await p.evaluate(() => { try { return { stars: S.stars, level: S.level, raw: JSON.parse(localStorage.getItem('dacha3v2') || '{}') }; } catch (x) { return { err: String(x) }; } });
    add(!e.length && st.stars === 7 && (st.level || 0) >= 12, 'Старое сохранение не теряется', JSON.stringify({ stars: st.stars, level: st.level }) + (e.length ? ' ошибки: ' + e[0] : ''));
    await c.close();
  }

  // 6. бот: проходим уровни (ускоряем таймеры)
  {
    const c = await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
    await c.route(/fonts\.g|unpkg|telegram\.org|adsgram|vk\.com/, r => r.abort());
    await c.addInitScript(() => {
      const st = window.setTimeout; window.setTimeout = (f, d, ...a) => st(f, (d || 0) / 12, ...a);
      localStorage.setItem('dacha3v2', JSON.stringify({ who: 'boy', stars: 0, level: 50, lives: 5, infUntil: Date.now() + 1e10, dLast: new Date().toISOString().slice(0, 10) }));
    });
    const p = await c.newPage(); const e = []; p.on('pageerror', x => e.push(x.message));
    await p.goto('file://' + file); await p.waitForTimeout(1500);
    try { await p.click('#spPlay', { timeout: 4000 }); } catch (x) {}
    await p.waitForTimeout(800);
    const has = await p.evaluate(() => typeof startLevel === 'function' && typeof trySwap === 'function' && typeof findRuns === 'function');
    if (!has) add(null, 'Бот по уровням', 'в файле нет функций startLevel/trySwap/findRuns: бот не запущен (возможно, сменился движок)');
    else {
      let won = 0, played = 0, stuck = 0;
      for (let L = 1; L <= LEVELS; L++) {
        const res = await p.evaluate(async (L) => {
          try { closeModal(); } catch (x) {}
          try { startLevel(L - 1); } catch (x) { return 'ошибка запуска'; }
          await new Promise(r => setTimeout(r, 300));
          let stuckTries = 0;
          for (let g = 0; g < 60; g++) {
            if (goalsDone()) return 'win'; if (G.moves <= 0) return 'lose';
            const B = G.board; let best = null;
            for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
              const y = r + dr, x = c + dc; if (y >= N || x >= N) continue; const A = B[r][c], T = B[y][x]; if (!A || !T || isBox(A) || isBox(T)) continue;
              let sc = 0; if (A.s === 'sun' || T.s === 'sun') sc = 30; else { swapIn(B, r, c, y, x); const runs = findRuns(B); swapIn(B, y, x, r, c); if (!runs.length) continue; for (const run of runs) { sc += run.cells.length * 2; for (const [rr, cc] of run.cells) { const t = B[rr][cc]; if (t && G.goals[t.t] > 0) sc += 6; if (G.weeds && G.weeds.has(rr * N + cc)) sc += 8; } } }
              if (!best || sc > best.sc) best = { sc, a: [r, c], b: [y, x] };
            }
            if (!best) { stuckTries = (stuckTries || 0) + 1; if (stuckTries > 6) return 'stuck'; await new Promise(r => setTimeout(r, 400)); g--; continue; }
            stuckTries = 0;
            await trySwap(best.a, best.b); await new Promise(r => setTimeout(r, 120));
          }
          return 'lose';
        }, L).catch(x => 'ошибка: ' + String(x).slice(0, 60));
        played++; if (res === 'win') won++; if (res === 'stuck' || /ошибка/.test(res)) { stuck++; console.log('  уровень', L, res); }
      }
      add(!e.length && stuck === 0, 'Бот прошёл уровни без зависаний и ошибок', `сыграно ${played}, выиграно ботом ${won} (простой бот: цифра нужна только для сравнения с main, не как оценка сложности), зависаний ${stuck}` + (e.length ? ', ошибки: ' + e[0] : ''));
    }
    await c.close();
  }
  await b.close();
  const bad = R.filter(r => r.ok === false).length, warn = R.filter(r => r.ok === null).length;
  console.log(`\nИТОГ: ${bad ? 'ВЕРНУТЬ — есть ошибки (' + bad + ')' : warn ? 'ПРИНЯТЬ С ПРАВКАМИ — предупреждений: ' + warn : 'ПРИНЯТЬ'}`);
  fs.writeFileSync(OUT + '/report.json', JSON.stringify(R, null, 1));
  process.exit(bad ? 1 : 0);
})();
