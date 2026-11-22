// Fetch data -> pick the page for the current Pune time -> render -> 8-bit grayscale PNG for the Kindle.
//   npm run render              the page for right now (what GitHub publishes)
//   PAGE=bedtime npm run render  force one page
//   PAGE=all npm run render      every page into out/pages/ for previewing
//   SW_DATE=2026-12-24           preview the sight word for another day
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { fetchWeather } from './weather.js';
import { fetchAirQuality } from './airquality.js';
import { moonPhase } from './moon.js';
import { wordOfTheDay } from './sightwords.js';
import { festivalOn, nextFestival, addDays } from './family.js';
import { localNow, choosePage } from './schedule.js';
import { PAGES } from './pages.js';

const cfg = JSON.parse(readFileSync(new URL('../config.json', import.meta.url)));
const outDir = new URL('../out/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const [w, aq] = await Promise.all([fetchWeather(cfg), fetchAirQuality(cfg)]);
const now = localNow(cfg.timezone);
// Between midnight and 6 am it's still "last night": keep yesterday's word as the one learned,
// and show today's as the next word. (GitHub sometimes runs a scheduled job hours late.)
const wordDate = process.env.SW_DATE || (now.hour < 6 ? addDays(now.iso, -1) : now.iso);
const word = (iso) => wordOfTheDay(iso, cfg.sightWords.startDate, cfg.sightWords.reviewCount);
const ctx = {
  cfg, w, aq, now,
  sw: word(wordDate),
  swTomorrow: word(addDays(wordDate, 1)),
  moon: moonPhase(),
  fest: festivalOn(now.iso) ?? nextFestival(now.iso), // the next one is only used when previewing
};
writeFileSync(new URL('weather.json', outDir), JSON.stringify({ ...w, airQuality: aq }, null, 2));

async function renderTo(tab, html, file) {
  await tab.setContent(html, { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  const shot = await tab.screenshot({ type: 'png' });
  // The Kindle's `eips -g` wants a grayscale PNG at the panel's exact resolution.
  await sharp(shot).resize(cfg.width, cfg.height).grayscale()
    .png({ palette: false, compressionLevel: 9 }).toColourspace('b-w').toFile(file);
}

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
try {
  const tab = await browser.newPage();
  await tab.setViewport({ width: cfg.width, height: cfg.height, deviceScaleFactor: 1 });

  if (process.env.PAGE === 'all') {
    const dir = new URL('pages/', outDir);
    mkdirSync(dir, { recursive: true });
    for (const [name, build] of Object.entries(PAGES)) {
      await renderTo(tab, build(ctx), fileURLToPath(new URL(`${name}.png`, dir)));
      console.log(`  ${name}`);
    }
    console.log(`Rendered ${Object.keys(PAGES).length} pages to out/pages/`);
  } else {
    const name = process.env.PAGE || choosePage(now, cfg.schedule);
    const html = PAGES[name](ctx);
    writeFileSync(new URL('preview.html', outDir), html);
    await renderTo(tab, html, fileURLToPath(new URL('dashboard.png', outDir)));
    // Tells the Kindle which battery badge to use (white or black background).
    writeFileSync(new URL('theme.txt', outDir), name === 'bedtime' ? 'dark\n' : 'light\n');
    writeFileSync(new URL('page.txt', outDir), `${name}\n`);
    writeFileSync(new URL('index.html', outDir),
      `<!doctype html><meta charset="utf-8"><title>${cfg.city} dashboard</title>` +
      `<body style="margin:0;background:#ddd;display:grid;place-items:center;min-height:100vh">` +
      `<img src="dashboard.png" width="${cfg.width}" height="${cfg.height}" style="box-shadow:0 2px 12px #0003">`);
    console.log(`Rendered "${name}" page: ${w.current.temp}° ${w.current.label}, word "${ctx.sw.word}", updated ${w.updated}`);
  }
} finally {
  await browser.close();
}
