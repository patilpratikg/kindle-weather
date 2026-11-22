// Picks which page to draw from the local time. First match wins:
//   bedtime  -> every night
//   festival -> all day on a date in data/festivals.json
//   weekend  -> Saturday and Sunday daytime
//   morning  -> school-day mornings
//   reading  -> school-day afternoons/evenings
//   main     -> everything else (weekday middays)
import { festivalOn } from './family.js';

const mins = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const within = (t, from, to) => (mins(from) <= mins(to) ? t >= mins(from) && t < mins(to) : t >= mins(from) || t < mins(to));

export function localNow(tz, date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false,
  }).formatToParts(date).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour) % 24;
  return {
    iso: `${parts.year}-${parts.month}-${parts.day}`,
    hour, minutes: hour * 60 + Number(parts.minute),
    weekday: parts.weekday, // Mon..Sun
  };
}

export function choosePage(now, s) {
  if (within(now.minutes, s.bedtime.from, s.bedtime.to)) return 'bedtime';
  if (festivalOn(now.iso)) return 'festival';
  if (now.weekday === 'Sat' || now.weekday === 'Sun') return 'weekend';
  if (within(now.minutes, s.morning.from, s.morning.to)) return 'morning';
  if (within(now.minutes, s.reading.from, s.reading.to)) return 'reading';
  return 'main';
}

// ---------------------------------------------------------------- refresh slots
// The Kindle refreshes at :00 and :30 (config.refresh: every 30 min, 06:00-21:30).
// GitHub runs a few minutes before each one and draws the picture for that next slot.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const shiftDay = (iso, n) => new Date(Date.parse(iso + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);

export const slotOf = (iso, minutes) => ({
  iso,
  minutes,
  hour: Math.floor(minutes / 60),
  weekday: WEEKDAYS[new Date(iso + 'T00:00:00Z').getUTCDay()],
});

// The next refresh slot after `now`; after the last slot of the day, the first one tomorrow.
export function nextSlot(now, refresh) {
  const from = mins(refresh.from), to = mins(refresh.to), every = refresh.every;
  const m = (Math.floor(now.minutes / every) + 1) * every;
  if (m < from) return slotOf(now.iso, from);
  if (m > to) return slotOf(shiftDay(now.iso, 1), from);
  return slotOf(now.iso, m);
}
