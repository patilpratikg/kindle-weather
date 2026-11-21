// Shared page shell: fonts, base styles, header, and the sight-word components every page uses.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const fontFace = (pkg, file, family, weight) => {
  const dir = join(dirname(require.resolve(`@fontsource/${pkg}/package.json`)), 'files');
  const b64 = readFileSync(join(dir, file)).toString('base64');
  return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
};
// Embedded so renders never depend on the network or the OS font set.
// Andika is designed for early readers (single-storey "a" and "g").
const FONTS = [
  ...[400, 600, 700].map((w) => fontFace('noto-sans', `noto-sans-latin-${w}-normal.woff2`, 'Noto Sans', w)),
  ...[400, 700].map((w) => fontFace('andika', `andika-latin-${w}-normal.woff2`, 'Andika', w)),
  fontFace('noto-sans-devanagari', 'noto-sans-devanagari-devanagari-600-normal.woff2', 'Deva', 600),
].join('\n');

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const BASE = (cfg) => `
${FONTS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${cfg.width}px;height:${cfg.height}px;overflow:hidden}
body{font-family:'Noto Sans',sans-serif;background:#fff;color:#000;padding:14px 22px 18px;display:flex;flex-direction:column}
body.dark{background:#000;color:#fff}
.kid{font-family:'Andika',sans-serif}
.deva{font-family:'Deva',sans-serif;font-weight:600}
.muted{color:#444}.dark .muted{color:#bbb}
.cap{font-size:12px;letter-spacing:.6px;text-transform:uppercase;color:#444}.dark .cap{color:#bbb}
.rule{border-top:1.5px solid currentColor}.thin{border-top:1px solid #777}
.box{border:2px solid currentColor;border-radius:16px}
.soft{border:1.5px solid #888;border-radius:14px}
.row{display:flex;align-items:center}
.sm{font-size:13px}
/* Header: the right 104px stay blank - the Kindle draws its battery badge there. */
header{display:grid;grid-template-columns:1fr auto 104px;align-items:end;height:34px;padding-bottom:8px}
header .l{font-size:17px;font-weight:600}header .c{font-size:13px;color:#444}.dark header .c{color:#bbb}
/* Sight word card */
.wcard{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;border:2.5px solid currentColor;border-radius:16px}
.wcard .w{font-family:'Andika',sans-serif;font-weight:700;line-height:1.05}
.sent{font-family:'Andika',sans-serif;line-height:1.25;text-wrap:balance}
.sent b{font-weight:700;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:5px}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{font-family:'Andika',sans-serif;font-size:22px;padding:1px 12px 3px;border:1.5px solid #555;border-radius:10px}
.dark .chip{border-color:#aaa}
`;

export const page = (cfg, { body, css = '', dark = false }) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${BASE(cfg)}${css}</style></head><body class="${dark ? 'dark' : ''}">${body}</body></html>`;

export const header = (left, center) =>
  `<header><div class="l">${left}</div><div class="c">${center}</div><div></div></header><div class="rule"></div>`;

// Font size that keeps a word inside a card of the given width.
export const wordSize = (word, scale = 1) =>
  Math.round(({ 1: 112, 2: 108, 3: 100, 4: 86, 5: 72, 6: 60 }[word.length] ?? 54) * scale);

export const sentenceHtml = (sw) => esc(sw.sentence).replace(/\{(.+?)\}/, '<b>$1</b>');

export function wordCard(sw, { width = 244, height = 172, label = 'Word of the day', scale = 1 } = {}) {
  return `<div class="wcard" style="width:${width}px;height:${height}px">
    <div class="cap">${label}</div>
    <div class="w" style="font-size:${wordSize(sw.word, scale)}px">${esc(sw.word)}</div>
  </div>`;
}

export const chips = (words) => `<div class="chips">${words.map((w) => `<span class="chip">${esc(w)}</span>`).join('')}</div>`;

// Full sight-word block: card + sentence + practice chips.
export function wordSection(sw, opts = {}) {
  const review = sw.review.length
    ? `<div class="cap">Practice</div>${chips(sw.review)}`
    : `<div class="cap">Your first word!</div>`;
  return `<section class="words row" style="gap:22px;padding:${opts.pad ?? '24px 0 26px'}">
    ${wordCard(sw, opts)}
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      <div class="sent" style="font-size:${opts.sentence ?? 30}px">${sentenceHtml(sw)}</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">${review}</div>
    </div>
  </section>`;
}
