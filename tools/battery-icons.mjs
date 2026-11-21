// Pre-renders the battery badge ("87%" + battery bar) for every level 0-100.
// The Kindle can't render fonts nicely itself, so it just picks the matching PNG
// and draws it into the header's top-right corner with `eips -g`.
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

export const BADGE = { width: 104, height: 28 };

const require = createRequire(import.meta.url);
const fontDir = join(dirname(require.resolve('@fontsource/noto-sans/package.json')), 'files');
const font = readFileSync(join(fontDir, 'noto-sans-latin-600-normal.woff2')).toString('base64');

export function badgeHtml(level) {
  const { width: W, height: H } = BADGE;
  // Battery body geometry
  const bx = 64, by = 7, bw = 34, bh = 15, pad = 2.5;
  const inner = bw - pad * 2;
  const fill = Math.max(level > 0 ? 1.5 : 0, (inner * level) / 100);
  const low = level <= 15;
  return `<!doctype html><html><head><style>
@font-face{font-family:'Noto Sans';font-weight:600;src:url(data:font/woff2;base64,${font}) format('woff2');}
html,body{margin:0;width:${W}px;height:${H}px;background:#fff;overflow:hidden}
</style></head><body>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="${bx - 7}" y="${by + bh - 2.5}" text-anchor="end" font-family="Noto Sans" font-weight="600"
        font-size="14" fill="${low ? '#000' : '#333'}">${level}%</text>
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3.5" fill="none" stroke="#000" stroke-width="1.6"/>
  <rect x="${bx + bw + 1}" y="${by + 4.5}" width="2.6" height="${bh - 9}" rx="1" fill="#000"/>
  ${fill > 0 ? `<rect x="${bx + pad}" y="${by + pad}" width="${fill.toFixed(2)}" height="${bh - pad * 2}" rx="1.5" fill="#000"/>` : ''}
  ${low ? `<line x1="${bx + bw / 2 + 4}" y1="${by + 3.5}" x2="${bx + bw / 2 + 4}" y2="${by + bh - 5.5}" stroke="#000" stroke-width="1.8" stroke-linecap="round"/>
           <circle cx="${bx + bw / 2 + 4}" cy="${by + bh - 3.4}" r="0.9" fill="#000"/>` : ''}
</svg></body></html>`;
}

// Writes light badges to outDir and inverted (white-on-black) ones to darkDir for the bedtime page.
export async function renderBadges(outDir, darkDir) {
  mkdirSync(outDir, { recursive: true });
  mkdirSync(darkDir, { recursive: true });
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ ...BADGE, deviceScaleFactor: 1 });
    for (let level = 0; level <= 100; level++) {
      await page.setContent(badgeHtml(level), { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const shot = await page.screenshot({ type: 'png' });
      await sharp(shot).grayscale().toColourspace('b-w').png({ compressionLevel: 9 })
        .toFile(join(outDir, `${level}.png`));
      await sharp(shot).grayscale().negate({ alpha: false }).toColourspace('b-w').png({ compressionLevel: 9 })
        .toFile(join(darkDir, `${level}.png`));
    }
  } finally {
    await browser.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = fileURLToPath(new URL('../kindle/weatherdash/battery/', import.meta.url));
  const dark = fileURLToPath(new URL('../kindle/weatherdash/battery-dark/', import.meta.url));
  await renderBadges(out, dark);
  console.log(`Rendered 101 light and 101 dark battery badges`);
}
