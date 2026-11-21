// Moon phase from a known new moon (6 Jan 2000, 18:14 UTC). Accurate to about half a day,
// which is plenty for a bedtime picture.
const SYNODIC = 29.530588853;
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

export function moonPhase(date = new Date()) {
  const days = (date.getTime() - REF_NEW_MOON) / 86400000;
  const phase = ((days / SYNODIC) % 1 + 1) % 1;
  const name =
    phase < 0.03 || phase > 0.97 ? 'New moon'
    : phase < 0.22 ? 'Waxing crescent'
    : phase < 0.28 ? 'First quarter'
    : phase < 0.47 ? 'Waxing gibbous'
    : phase < 0.53 ? 'Full moon'
    : phase < 0.72 ? 'Waning gibbous'
    : phase < 0.78 ? 'Last quarter'
    : 'Waning crescent';
  const toFull = Math.round((((0.5 - phase) % 1 + 1) % 1) * SYNODIC);
  const toNew = Math.round(((1 - phase) % 1) * SYNODIC);
  let note;
  if (name === 'Full moon') note = 'Full moon tonight!';
  else if (name === 'New moon') note = 'No moon tonight · look for stars';
  else if (phase < 0.5) note = toFull === 1 ? 'Full moon tomorrow' : `Full moon in ${toFull} days`;
  else note = toNew === 1 ? 'New moon tomorrow' : `New moon in ${toNew} days`;
  return { phase, name, note };
}
