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
  await splashPlay.click();
  await page.waitForTimeout(600);
  if (await page.locator('#home').isHidden()) throw new Error('Home not shown after splash');
  await page.locator('#wardrobeBtn').click();
  if (await page.locator('#modal').isHidden()) throw new Error('Wardrobe did not open');
  await page.screenshot({ path: 'smoke-wardrobe.png', fullPage: true });
  await page.locator('#modal').evaluate(el => { el.hidden = true; });
  await page.locator('#gardenStyleBtn').click();
  if (await page.locator('#modal').isHidden()) throw new Error('Garden style did not open');
  await page.screenshot({ path: 'smoke-garden.png', fullPage: true });
  if (errors.length) throw new Error('JavaScript errors: '+errors.join(' | '));
  console.log('PASS: splash, home, wardrobe, garden style, no uncaught JS errors');
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
