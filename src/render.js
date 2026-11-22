// Fetch data, then draw the Kindle picture as an 8-bit grayscale PNG.
//
//   npm run render                What GitHub publishes: the picture for the NEXT refresh slot
//                                 (:00 or :30). GitHub runs at :25 and :55, so it's ready when the
//                                 Kindle wakes.
//   PAGE=bedtime npm run render   Force one page (for previewing), drawn for right now.
//   PAGE=all npm run render       Every page into out/pages/.
//   SW_DATE=YYYY-MM-DD SW_TIME=HH:MM   Preview a different moment (with PAGE=...).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { fetchWeather, weatherAt } from './weather.js';
import { fetchAirQuality } from './airquality.js';
import { moonPhase } from './moon.js';
import { wordAt, wordIndex, firstWordIndex } from './sightwords.js';
import { festivalOn, nextFestival, addDays } from './family.js';
import { localNow, choosePage, nextSlot, slotOf } from './schedule.js';
import { PAGES } from './pages.js';

const cfg = JSON.parse(readFileSync(new URL('../config.json', import.meta.url)));
const outDir = new URL('../out/', import.meta.url);
mkdirSync(outDir, { recursive: true });
const out = (p) => fileURLToPath(new URL(p, outDir));

const [forecast, aq] = await Promise.all([fetchWeather(cfg), fetchAirQuality(cfg)]);
writeFileSync(out('weather.json'), JSON.stringify({ ...forecast, airQuality: aq }, null, 2));
const now = localNow(cfg.timezone);

const sw = cfg.sightWords;
const labels = sw.mode === 'refresh'
  ? { word: 'Read this word', short: 'Read this word', learned: 'Last word today', next: 'First word tomorrow', progress: 'Word' }
  : { word: 'Word of the day', short: "Today's word", learned: 'Today you learned', next: "Tomorrow's word", progress: 'Words I can read' };

// Everything a page needs to draw itself as of `slot` (a date and time).
function contextFor(slot) {
  const word = wordAt(wordIndex(slot.iso, slot.minutes, sw, cfg.refresh), sw.reviewCount);
  const next = wordAt(firstWordIndex(addDays(slot.iso, 1), sw, cfg.refresh), sw.reviewCount);
  word.label = next.label = labels.word;
  return {
    cfg, aq, labels,
    now: slot,
    w: weatherAt(forecast, slot.iso, slot.minutes),
    sw: word,
    swTomorrow: next,
    moon: moonPhase(),
    fest: festivalOn(slot.iso) ?? nextFestival(slot.iso), // the next one is only used when previewing
  };
}

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

  if (process.env.PAGE) {
    // Preview: draw for right now, or for SW_DATE / SW_TIME.
    const t = process.env.SW_TIME ? process.env.SW_TIME.split(':').reduce((h, m) => h * 60 + +m) : now.minutes;
    const ctx = contextFor(slotOf(process.env.SW_DATE || now.iso, t));
    const all = process.env.PAGE === 'all';
    if (all) mkdirSync(out('pages/'), { recursive: true });
    for (const name of all ? Object.keys(PAGES) : [process.env.PAGE]) {
      const html = PAGES[name](ctx);
      if (!all) writeFileSync(out('preview.html'), html);
      await renderTo(tab, html, all ? out(`pages/${name}.png`) : out('dashboard.png'));
      console.log(`  ${name}: word "${ctx.sw.word}"`);
    }
  } else {
    // Publish: the picture for the next :00 / :30 slot.
    const slot = nextSlot(now, cfg.refresh);
    const ctx = contextFor(slot);
    const page = choosePage(slot, cfg.schedule);
    const html = PAGES[page](ctx);
    writeFileSync(out('preview.html'), html);
    await renderTo(tab, html, out('dashboard.png'));
    // Tells the Kindle which battery badge to use (white or black background).
    writeFileSync(out('theme.txt'), page === 'bedtime' ? 'dark\n' : 'light\n');
    const at = `${slot.iso} ${String(slot.hour).padStart(2, '0')}:${String(slot.minutes % 60).padStart(2, '0')}`;
    writeFileSync(out('page.txt'), `${page} for ${at}\n`);
    writeFileSync(out('index.html'),
      `<!doctype html><meta charset="utf-8"><title>${cfg.city} dashboard</title>` +
      `<body style="margin:0;background:#ddd;display:grid;place-items:center;min-height:100vh">` +
      `<img src="dashboard.png" width="${cfg.width}" height="${cfg.height}" style="box-shadow:0 2px 12px #0003">`);
    console.log(`Drew "${page}" for ${at} (word "${ctx.sw.word}"), at ${forecast.updated}`);
  }
} finally {
  await browser.close();
}
