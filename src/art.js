// Line-art pictures for e-ink: strokes in currentColor, so they work on white and black pages.

export const svg = (body, size, vb = 24, sw = 1.6, filled = false) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 ${vb} ${vb}" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const PICS = {
  tooth: '<path d="M7 3c-2.5 0-4 2-4 4.5 0 2 1 3.5 1.5 6S5.5 21 7.5 21c1.5 0 1.5-5 4.5-5s3 5 4.5 5c2 0 2.5-5 3-7.5S21 9.5 21 7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/>',
  shirt: '<path d="M8 3L3 6l2 4 3-1v12h8V9l3 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z"/>',
  sweater: '<path d="M8 3L3 6v13h3v-9l2-1v12h8V9l2 1v9h3V6l-5-3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z"/><path d="M8 18h8"/>',
  umbrella: '<path d="M2.5 12a9.5 9.5 0 0 1 19 0z"/><path d="M12 12v7a2 2 0 0 1-4 0"/><path d="M12 2.5v0"/>',
  cap: '<path d="M4 15a8 6 0 0 1 16 0z"/><path d="M4 15h17l-1 2H4z"/><circle cx="12" cy="8" r=".6"/>',
  bowl: '<path d="M3 12h18a9 7 0 0 1-18 0z"/><path d="M8 21h8"/><path d="M9.5 8c0-1.6 1.5-1.6 1.5-3.5M13.5 8c0-1.6 1.5-1.6 1.5-3.5"/>',
  bag: '<rect x="5" y="7" width="14" height="14" rx="3"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7"/><rect x="8.5" y="13" width="7" height="4" rx="1"/>',
  shoe: '<path d="M3 15V9l4 1 3 3 9 1.5c1.5.3 2 1.2 2 2.5v1H3z"/><path d="M3 18h18"/>',
  cup: '<path d="M7 4h10l-1.2 16H8.2z"/><path d="M7.4 9h9.2"/>',
  comb: '<rect x="3" y="9" width="18" height="4" rx="1"/><path d="M5 13v5M8 13v5M11 13v5M14 13v5M17 13v5M20 13v4"/>',
  star: '<polygon points="12 2.5 14.9 8.6 21.5 9.3 16.6 13.8 18 20.4 12 17 6 20.4 7.4 13.8 2.5 9.3 9.1 8.6"/>',
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M5 4L2.5 6.5M19 4l2.5 2.5"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11"/><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z"/>',
  cake: '<rect x="4" y="12" width="16" height="8" rx="1.5"/><path d="M4 15.5c2 1.5 4 1.5 5.3 0s4-1.5 5.4 0 4 1.5 5.3 0"/><path d="M8 12V9M12 12V9M16 12V9"/><path d="M8 6.5v0M12 6.5v0M16 6.5v0"/>',
  mountain: '<path d="M2 20l7-11 4 6 3-4 6 9z"/><path d="M7.5 11.5l1.5 1.5 1.5-1.5"/>',
  tree: '<path d="M12 21v-5"/><path d="M12 3l6 8h-3l4 5H5l4-5H6z"/>',
  house: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  book: '<path d="M4 5c3-1.5 6-1.5 8 .5v14c-2-2-5-2-8-.5zM20 5c-3-1.5-6-1.5-8 .5v14c2-2 5-2 8-.5z"/>',
  diya: '<path d="M3 13c1 4 5 6 9 6s8-2 9-6z"/><path d="M12 13c-1.6-1.4-2-3.4-.6-5.6L12 6l.6 1.4c1.4 2.2 1 4.2-.6 5.6z"/><path d="M8 21h8"/>',
  kite: '<path d="M12 2l7 8-7 8-7-8z"/><path d="M12 2v16M5 10h14"/><path d="M12 18c-1 2 1 2 0 4"/>',
  flag: '<path d="M5 21V3"/><rect x="5" y="4" width="15" height="10" rx="1"/><path d="M5 7.3h15M5 10.7h15"/><circle cx="12.5" cy="9" r="1.2"/>',
  splash: '<circle cx="8" cy="9" r="3.5"/><circle cx="16" cy="8" r="2.5"/><circle cx="14" cy="16" r="4"/><circle cx="6" cy="17" r="1.8"/>',
  sparkle: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
};

export const pic = (name, size, sw = 1.6, filled = false) => svg(PICS[name] ?? PICS.star, size, 24, sw, filled);
export const hasPic = (name) => name in PICS;

// Moon at a given phase (0 = new, 0.5 = full). Lit part in `lit`, dark part in `dark`.
export function moonSvg(phase, size, lit = '#fff', dark = '#2a2a2a') {
  const r = 44, k = Math.cos(2 * Math.PI * phase);
  const rx = (r * Math.abs(k)).toFixed(2);
  const waxing = phase < 0.5;
  // Outer edge of the lit half, then back along the terminator ellipse.
  const outer = waxing ? `A${r} ${r} 0 0 1 50 94` : `A${r} ${r} 0 0 0 50 94`;
  const sweep = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  const litPath = `M50 6 ${outer} A${rx} ${r} 0 0 ${sweep} 50 6Z`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="${r}" fill="${dark}" stroke="#666" stroke-width="1"/>
    <path d="${litPath}" fill="${lit}"/>
  </svg>`;
}
