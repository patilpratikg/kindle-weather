import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { icon } from './icons.js';

const require = createRequire(import.meta.url);
const fontsDir = (pkg) => join(dirname(require.resolve(`@fontsource/${pkg}/package.json`)), 'files');

// Fonts are embedded so the render never depends on the network or the OS font set.
// Andika is designed for early readers (single-storey "a" and "g", clear letter shapes).
const fontFace = (pkg, family, weight) => {
  const b64 = readFileSync(join(fontsDir(pkg), `${pkg}-latin-${weight}-normal.woff2`)).toString('base64');
  return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
};
const FONTS = [
  ...[400, 600, 700].map((wt) => fontFace('noto-sans', 'Noto Sans', wt)),
  ...[400, 700].map((wt) => fontFace('andika', 'Andika', wt)),
].join('\n');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Shrink long words so they always fit the card.
const wordSize = (word) => ({ 1: 112, 2: 108, 3: 100, 4: 86, 5: 72, 6: 60 }[word.length] ?? 54);

function sightWordSection(sw) {
  const sentence = esc(sw.sentence).replace(/\{(.+?)\}/, '<b>$1</b>');
  const review = sw.review.length
    ? `<div class="w-k">Practice</div><div class="w-chips">${sw.review.map((r) => `<span class="chip">${esc(r)}</span>`).join('')}</div>`
    : `<div class="w-k">Your first word!</div>`;
  return `
  <section class="words">
    <div class="w-card">
      <div class="w-label">Word of the day</div>
      <div class="w-word" style="font-size:${wordSize(sw.word)}px">${esc(sw.word)}</div>
    </div>
    <div class="w-right">
      <div class="w-sentence">${sentence}</div>
      <div class="w-review">${review}</div>
    </div>
  </section>`;
}

export function renderHtml(w, cfg, sw) {
  const { current: c, today: t, tomorrow: tm, date: d } = w;

  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
${FONTS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${cfg.width}px;height:${cfg.height}px;background:#fff;color:#000;overflow:hidden}
body{font-family:'Noto Sans',sans-serif;padding:14px 22px 18px;display:flex;flex-direction:column}
.muted{color:#444}
.rule{border-top:1.5px solid #000}
.thin{border-top:1px solid #666}

header{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;height:34px;padding-bottom:8px}
header .city{font-size:17px;font-weight:600}
header .updated{font-size:13px}
header .battery{justify-self:end;width:104px} /* left blank: the Kindle draws its battery level here */

.now{display:grid;grid-template-columns:1.15fr 1fr;gap:18px;padding:28px 0 26px}
.now-left{display:flex;flex-direction:column;align-items:center;justify-content:center}
.now-main{display:flex;align-items:center;gap:6px}
.now-temp{font-size:96px;font-weight:600;line-height:1;letter-spacing:-2px}
.now-label{font-size:21px;margin-top:10px}
.now-sub{font-size:13px;margin-top:4px}
.now-right{display:flex;flex-direction:column;gap:10px}
.k{font-size:12px}
.hilo{font-size:27px;font-weight:700;line-height:1.15}
.cond{font-size:16px;margin-top:6px}
.small{font-size:13px}
.tomorrow{display:flex;align-items:center;gap:10px;padding-top:10px}
.tomorrow .hilo{font-size:21px}

.words{display:flex;align-items:center;gap:22px;padding:24px 0 26px}
.w-card{width:244px;height:172px;flex:none;border:2.5px solid #000;border-radius:16px;
  display:flex;flex-direction:column;align-items:center;justify-content:center}
.w-label{font-size:12px;color:#444;letter-spacing:.5px;text-transform:uppercase;margin-top:-4px}
.w-word{font-family:'Andika',sans-serif;font-weight:700;line-height:1.05}
.w-right{flex:1;display:flex;flex-direction:column;gap:16px}
.w-sentence{font-family:'Andika',sans-serif;font-size:30px;line-height:1.25;text-wrap:balance}
.w-sentence b{font-weight:700;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:5px}
.w-review{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.w-k{font-size:12px;color:#444;text-transform:uppercase;letter-spacing:.5px}
.w-chips{display:flex;gap:8px}
.chip{font-family:'Andika',sans-serif;font-size:23px;padding:1px 12px 3px;border:1.5px solid #444;border-radius:10px}

.date{flex:1;display:flex;align-items:center;gap:28px;padding:10px 6px 0}
.d-num{font-size:150px;font-weight:700;line-height:.9;letter-spacing:-6px}
.d-week{font-size:22px}
.d-month{font-size:36px;font-weight:700;line-height:1.2}
.d-year{font-size:19px;margin-top:4px}
.d-sun{font-size:14px;margin-top:16px}
</style></head>
<body>
  <header>
    <div class="city">${esc(w.city)}</div>
    <div class="updated muted">Updated ${w.updated}</div>
    <div class="battery"></div>
  </header>
  <div class="rule"></div>

  <section class="now">
    <div class="now-left">
      <div class="now-main">${icon(c.icon, 96, 1.2)}<div class="now-temp">${c.temp}°</div></div>
      <div class="now-label">${esc(c.label)}</div>
      <div class="now-sub muted">Feels like ${c.feels}° · Humidity ${c.humidity}%</div>
    </div>
    <div class="now-right">
      <div>
        <div class="k muted">Today</div>
        <div class="hilo">${t.max}° / ${t.min}°</div>
        <div class="cond">${esc(t.label)}</div>
        <div class="small muted">${t.rain}% rain · ${t.wind} km/h</div>
      </div>
      <div class="thin"></div>
      <div class="tomorrow">
        ${icon(tm.icon, 40, 1.4)}
        <div>
          <div class="k muted">Tomorrow</div>
          <div class="hilo">${tm.max}° / ${tm.min}°</div>
          <div class="small muted">${tm.rain}% rain</div>
        </div>
      </div>
    </div>
  </section>
  <div class="thin"></div>

  ${sightWordSection(sw)}
  <div class="thin"></div>

  <section class="date">
    <div class="d-num">${d.day}</div>
    <div>
      <div class="d-week">${d.weekday}</div>
      <div class="d-month">${d.month}</div>
      <div class="d-year">${d.year}</div>
      <div class="d-sun muted">Sunrise ${d.sunrise} · Sunset ${d.sunset}</div>
    </div>
  </section>
</body></html>`;
}
