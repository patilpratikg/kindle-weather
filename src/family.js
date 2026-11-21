// Family data (data/*.json) plus small rules that turn weather into kid-friendly advice.
import { readFileSync } from 'node:fs';

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url)));
export const family = load('family.json');
export const festivals = load('festivals.json').festivals;

const dayNum = (iso) => Math.round(Date.UTC(...iso.split('-').map((n, i) => (i === 1 ? n - 1 : +n))) / 86400000);

export const festivalOn = (iso) => festivals.find((f) => f.date === iso) ?? null;

export function nextFestival(iso) {
  const today = dayNum(iso);
  return festivals
    .map((f) => ({ ...f, days: dayNum(f.date) - today }))
    .filter((f) => f.days > 0)
    .sort((a, b) => a.days - b.days)[0] ?? null;
}

// Nearest countdown that hasn't passed. "sleeps" = nights until the date.
export function nextCountdown(iso) {
  const today = dayNum(iso);
  const c = family.countdowns
    .map((x) => ({ ...x, days: dayNum(x.date) - today }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days)[0];
  if (!c) return null;
  const big = c.days === 0 ? 'Today!' : c.days === 1 ? '1 sleep' : `${c.days} sleeps`;
  return { ...c, big };
}

export function wearAdvice(w) {
  const { today: t, current: c } = w;
  if (t.rain >= 50) return { icon: 'umbrella', title: 'Take an umbrella', sub: `${t.rain}% chance of rain today` };
  if (c.temp <= 18 || t.min <= 15) return { icon: 'sweater', title: 'Wear a sweater', sub: `Cool now · warm by afternoon, ${t.max}°` };
  if (t.max >= 34) return { icon: 'cap', title: 'Cap and water bottle', sub: `Hot day, up to ${t.max}°` };
  return { icon: 'shirt', title: 'T-shirt weather', sub: `Comfortable today, up to ${t.max}°` };
}

// Weekend outing: outdoors if a weekend day looks dry and the air is OK, otherwise an indoor idea.
// Rotates weekly so the suggestion changes.
export function outingIdea(w, aq) {
  const week = Math.floor(dayNum(w.date.iso) / 7);
  const weekend = w.days.filter((d) => d.name === 'Sat' || d.name === 'Sun');
  const candidates = weekend.length ? weekend : w.days.slice(0, 2);
  const best = [...candidates].sort((a, b) => a.rain - b.rain)[0];
  const airOk = !aq || aq.aqi <= 150;
  if (best && best.rain < 40 && airOk) {
    const o = family.outings.outdoor[week % family.outings.outdoor.length];
    return { kind: 'outdoor', title: 'Good day for an outing', place: o.name, tip: `${best.name === w.days[0].name ? 'Today' : best.name}: ${best.label.toLowerCase()}, ${best.max}° · ${o.tip}` };
  }
  const o = family.outings.indoor[week % family.outings.indoor.length];
  const why = !airOk ? 'The air is not great outside' : 'Rain is likely';
  return { kind: 'indoor', title: 'Indoor idea', place: o.name, tip: `${why} · ${o.tip}` };
}

export const isSchoolDay = (iso) => {
  const wd = new Date(iso + 'T00:00:00Z').getUTCDay();
  return wd >= 1 && wd <= 5 && !festivalOn(iso);
};

export const addDays = (iso, n) => new Date(Date.UTC(...iso.split('-').map((x, i) => (i === 1 ? x - 1 : +x))) + n * 86400000).toISOString().slice(0, 10);
