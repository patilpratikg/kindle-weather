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
