import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { icon } from './icons.js';

const require = createRequire(import.meta.url);
const fontDir = join(dirname(require.resolve('@fontsource/noto-sans/package.json')), 'files');

// Fonts are embedded so the render never depends on the network or the OS font set.
const fontFace = (weight) => {
  const b64 = readFileSync(join(fontDir, `noto-sans-latin-${weight}-normal.woff2`)).toString('base64');
  return `@font-face{font-family:'Noto Sans';font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function renderHtml(w, cfg) {
  const { current: c, today: t, tomorrow: tm, hours, date: d } = w;

  const hourCells = hours.map((h) => `
      <div class="hour">
        <div class="h-time">${h.time}</div>
        ${icon(h.icon, 40, 1.4)}
        <div class="h-temp">${h.temp}°</div>
        <div class="h-rain">${h.rain}%</div>
      </div>`).join('');

  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
${[400, 600, 700].map(fontFace).join('\n')}
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

.hours{display:grid;grid-template-columns:repeat(${hours.length},1fr);padding:24px 0 26px;text-align:center}
.hour{display:flex;flex-direction:column;align-items:center;gap:8px}
.h-time{font-size:14px}
.h-temp{font-size:19px;font-weight:600}
.h-rain{font-size:13px}

.date{flex:1;display:flex;align-items:center;gap:28px;padding:10px 6px 0}
.d-num{font-size:170px;font-weight:700;line-height:.9;letter-spacing:-6px}
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

  <section class="hours">${hourCells}
  </section>
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
