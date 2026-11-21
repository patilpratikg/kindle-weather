// Fetch weather -> build HTML -> screenshot -> 8-bit grayscale PNG sized for the Kindle.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { fetchWeather } from './weather.js';
import { renderHtml } from './template.js';
import { wordOfTheDay } from './sightwords.js';

const cfg = JSON.parse(readFileSync(new URL('../config.json', import.meta.url)));
const outDir = new URL('../out/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const weather = await fetchWeather(cfg);
// SW_DATE=YYYY-MM-DD previews the sight word for another day.
const sw = wordOfTheDay(process.env.SW_DATE || weather.date.iso, cfg.sightWords.startDate, cfg.sightWords.reviewCount);
const html = renderHtml(weather, cfg, sw);
writeFileSync(new URL('preview.html', outDir), html);
writeFileSync(new URL('weather.json', outDir), JSON.stringify(weather, null, 2));

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: cfg.width, height: cfg.height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot({ type: 'png' });

  // The Kindle's `eips -g` wants a grayscale PNG at the panel's exact resolution.
  await sharp(shot)
    .resize(cfg.width, cfg.height)
    .grayscale()
    .png({ palette: false, compressionLevel: 9 })
    .toColourspace('b-w')
    .toFile(fileURLToPath(new URL('dashboard.png', outDir)));
} finally {
  await browser.close();
}

writeFileSync(new URL('index.html', outDir),
  `<!doctype html><meta charset="utf-8"><title>${cfg.city} dashboard</title>` +
  `<body style="margin:0;background:#ddd;display:grid;place-items:center;min-height:100vh">` +
  `<img src="dashboard.png" width="${cfg.width}" height="${cfg.height}" style="box-shadow:0 2px 12px #0003">`);

console.log(`Rendered ${cfg.city}: ${weather.current.temp}° ${weather.current.label}, updated ${weather.updated}`);
