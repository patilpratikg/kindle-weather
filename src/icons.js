// Line-art weather icons drawn for e-ink: black strokes, no fills, 24x24 viewBox.

const cloudPath = 'M7 19h10.5a4 4 0 0 0 .4-7.98A5.75 5.75 0 0 0 6.9 10.2 4.4 4.4 0 0 0 7 19z';
const cloud = (dx = 0, dy = 0, s = 1) =>
  `<path transform="translate(${dx} ${dy}) scale(${s})" d="${cloudPath}"/>`;

const rays = (cx, cy, r1, r2) => {
  let out = '';
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1;
    const x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2;
    out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
  }
  return out;
};

const drops = (xs, y1, y2) =>
  xs.map((x) => `<line x1="${x}" y1="${y1}" x2="${x - 1}" y2="${y2}"/>`).join('');

const moonPath = (dx = 0, dy = 0, s = 1) =>
  `<path transform="translate(${dx} ${dy}) scale(${s})" d="M19.5 14.6A7.6 7.6 0 1 1 9.4 4.5a6 6 0 0 0 10.1 10.1z"/>`;

const SHAPES = {
  sun: `<circle cx="12" cy="12" r="4.2"/>${rays(12, 12, 6.6, 9.4)}`,
  moon: moonPath(),
  cloud: cloud(),
  partlyDay:
    `<circle cx="8.5" cy="8.5" r="3"/>${rays(8.5, 8.5, 4.6, 6.4)}` +
    `<path fill="white" d="M9.5 21h9a3.4 3.4 0 0 0 .35-6.78 4.9 4.9 0 0 0-9.4-.7A3.7 3.7 0 0 0 9.5 21z"/>`,
  partlyNight:
    moonPath(-2, -2, 0.75) +
    `<path fill="white" d="M9.5 21h9a3.4 3.4 0 0 0 .35-6.78 4.9 4.9 0 0 0-9.4-.7A3.7 3.7 0 0 0 9.5 21z"/>`,
  fog: `${cloud(0, -3)}<line x1="4" y1="19" x2="20" y2="19"/><line x1="6" y1="22" x2="18" y2="22"/>`,
  drizzle: `${cloud(0, -4)}${drops([9, 15], 18, 20)}`,
  rain: `${cloud(0, -4)}${drops([8.5, 12, 15.5], 18, 21.5)}`,
  heavyrain: `${cloud(0, -4)}${drops([7, 10.5, 14, 17.5], 17.5, 22)}`,
  thunder: `${cloud(0, -4)}<path d="M12.5 15l-2.5 4h3l-2 4"/>`,
  snow: `${cloud(0, -4)}<circle cx="8.5" cy="19" r=".6"/><circle cx="12" cy="21" r=".6"/><circle cx="15.5" cy="19" r=".6"/>`,
};

export function icon(name, size = 32, stroke = 1.5) {
  const body = SHAPES[name] ?? SHAPES.cloud;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
