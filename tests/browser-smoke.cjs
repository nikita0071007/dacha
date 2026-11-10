const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto('file://' + path.resolve('index.html'));
  await page.waitForTimeout(1500);
  const checks = [
    ['splash', '#splash'],
    ['music button', '#musicBtn'],
    ['sound button', '#soundBtn'],
    ['wardrobe', '#wardrobeBtn'],
    ['garden style', '#gardenStyleBtn'],
    ['grandma', '#granny']
  ];
  for (const [name, selector] of checks) {
    if (await page.locator(selector).count() !== 1) throw new Error('Missing '+name);
  }
  const splashPlay = page.locator('#spPlay');
  await splashPlay.waitFor({ state: 'visible', timeout: 15000 });
  await page.screenshot({ path: 'smoke-splash.png', fullPage: true });
  await splashPlay.click();
  await page.waitForTimeout(600);
  if (await page.locator('#whoBoy').count()) {
    await page.locator('#whoBoy').click();
    await page.locator('#visitorName').fill('Тест');
    await page.locator('#visitorGo').click();
  }
  if (await page.locator('#modal').isVisible()) throw new Error('Introduction did not finish normally');
  const intro = await page.evaluate(() => JSON.parse(localStorage.getItem('dacha3v2') || '{}'));
  if (intro.who !== 'boy' || intro.visitorName !== 'Тест') throw new Error('Visitor selection was not saved');
  if (await page.locator('#home').isHidden()) throw new Error('Home not shown after splash');
  const gardenArt = await page.evaluate(() => {
    const svg = document.querySelector('#granny .gf svg.gr');
    const rect = svg && svg.getBoundingClientRect();
    return { spriteWidth:rect&&rect.width, greenDress:!!(svg&&svg.querySelector('.marina-dress')),
      landscape:!!document.querySelector('#scene svg.garden-landscape'),
      gardenVisible:document.querySelector('#scene').getBoundingClientRect().height>200 };
  });
  if(!gardenArt.greenDress||!gardenArt.landscape||!gardenArt.gardenVisible||gardenArt.spriteWidth<45)
    throw new Error('Garden art failed visual sizing checks: '+JSON.stringify(gardenArt));
  await page.screenshot({ path: 'smoke-home.png', fullPage: true });
  await page.locator('#wardrobeBtn').click();
  if (await page.locator('#modal').isHidden()) throw new Error('Wardrobe did not open');
  await page.screenshot({ path: 'smoke-wardrobe.png', fullPage: true });
  await page.locator('#modal').evaluate(el => { el.hidden = true; });
  await page.locator('#gardenStyleBtn').click();
  if (await page.locator('#modal').isHidden()) throw new Error('Garden style did not open');
  await page.screenshot({ path: 'smoke-garden.png', fullPage: true });
  await page.locator('#modal').evaluate(el => { el.hidden = true; });
  await page.locator('#musicBtn').click();
  await page.locator('#musicBtn').click();
  await page.locator('#soundBtn').click();
  await page.locator('#soundBtn').click();
  await page.locator('#granny').click();
  await page.locator('#playBtn').click();
  await page.waitForTimeout(900);
  if (await page.locator('#game').isHidden()) throw new Error('Level did not open');
  // Dismiss daily/login overlays in screenshot capture so the actual match-3 board is visible.
  if (await page.locator('#modal').isVisible()) await page.locator('#modal').evaluate(el => { el.hidden=true; });
  await page.screenshot({ path: 'smoke-game.png', fullPage: true });
  const boards = await page.evaluate(() => {
    const issues = [];
    for(let level=0;level<LEVELS.length;level++){
      for(let sample=0;sample<4;sample++){
        const B=genBoard(LEVELS[level].boxes);
        if(findRuns(B).length)issues.push('initial matches at level '+(level+1));
        if(!hasMove(B))issues.push('no valid move at level '+(level+1));
        if(B.length!==N||B.some(row=>row.length!==N))issues.push('invalid board dimensions');
      }
    }
    return {levels:LEVELS.length,issues};
  });
  if(boards.levels!==50||boards.issues.length)throw new Error('Board generation: '+JSON.stringify(boards));
  // Capture the actual win UI; this is debug-triggered, NOT evidence a player completed the level.
  await page.evaluate(() => win());
  await page.waitForTimeout(450);
  if (await page.locator('#modal').isHidden()) throw new Error('Test-triggered victory UI did not open');
  await page.screenshot({ path: 'smoke-victory-test-triggered.png', fullPage: true });
  await page.reload();
  await page.waitForTimeout(500);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('dacha3v2') || '{}'));
  if (saved.who !== 'boy' || saved.visitorName !== 'Тест') throw new Error('Saved visitor lost after reload');
  // Corrupted local storage must not crash the game or unlock invalid levels.
  await page.evaluate(() => {
    const broken = {who:'boy', visitorName:'Тест', level:999, stars:-99, lives:999, bought:null, pets:['cat','cat','invalid'], best:null, boost:null, lifeTs:Date.now()+86400000};
    localStorage.setItem('dacha3v2', JSON.stringify(broken));
  });
  await page.reload();
  await page.waitForTimeout(400);
  const recovered = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('dacha3v2') || '{}');
    return {level:state.level,stars:state.stars,lives:state.lives,pets:state.pets,bought:state.bought};
  });
  if (recovered.level !== 50 || recovered.stars !== 0 || recovered.lives > 5 ||
      !Array.isArray(recovered.bought) || JSON.stringify(recovered.pets)!=='["cat"]') {
    throw new Error('Corrupted save recovery failed: '+JSON.stringify(recovered));
  }
  if (errors.length) throw new Error('JavaScript errors: '+errors.join(' | '));
  console.log('PASS: intro, persistent visitor, home, wardrobe, garden style, level, no uncaught JS errors');
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
