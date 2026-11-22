// Fetches the forecast from Open-Meteo (free, no API key) and shapes it for the template.

const CODES = {
  0: ['Clear', 'clear'],
  1: ['Mostly clear', 'clear'],
  2: ['Partly cloudy', 'partly'],
  3: ['Cloudy', 'cloud'],
  45: ['Fog', 'fog'],
  48: ['Fog', 'fog'],
  51: ['Light drizzle', 'drizzle'],
  53: ['Drizzle', 'drizzle'],
  55: ['Heavy drizzle', 'drizzle'],
  56: ['Freezing drizzle', 'drizzle'],
  57: ['Freezing drizzle', 'drizzle'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'heavyrain'],
  66: ['Freezing rain', 'rain'],
  67: ['Freezing rain', 'heavyrain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Showers', 'rain'],
  81: ['Showers', 'rain'],
  82: ['Heavy showers', 'heavyrain'],
  85: ['Snow showers', 'snow'],
  86: ['Snow showers', 'snow'],
  95: ['Thunderstorm', 'thunder'],
  96: ['Thunderstorm', 'thunder'],
  99: ['Thunderstorm', 'thunder'],
};

export function describe(code, isDay = 1) {
  const [label, base] = CODES[code] ?? ['Unknown', 'cloud'];
  let icon = base;
  if (base === 'clear') icon = isDay ? 'sun' : 'moon';
  if (base === 'partly') icon = isDay ? 'partlyDay' : 'partlyNight';
  return { label, icon };
}

export async function fetchWeather(cfg) {
  const params = new URLSearchParams({
    latitude: cfg.latitude,
    longitude: cfg.longitude,
    timezone: cfg.timezone,
    forecast_days: '5',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m',
    hourly: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,is_day,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}: ${await res.text()}`);
  return shape(await res.json(), cfg);
}

const round = (n) => Math.round(n);
const hhmm = (iso) => iso.slice(11, 16);
const longDate = (iso, opt) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { ...opt, timeZone: 'UTC' });

// Everything fetched, kept as plain arrays so a view can be built for any time (see weatherAt).
function shape(raw, cfg) {
  const { current: c, hourly: h, daily: d } = raw;
  return {
    city: cfg.city,
    fetchedAt: c.time, // local time, e.g. "2026-11-22T13:15"
    updated: new Intl.DateTimeFormat('en-GB', {
      timeZone: cfg.timezone, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date()),
    now: {
      temp: round(c.temperature_2m),
      feels: round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      wind: round(c.wind_speed_10m),
      ...describe(c.weather_code, c.is_day),
    },
    hourly: h.time.map((time, k) => ({
      time,
      temp: round(h.temperature_2m[k]),
      feels: round(h.apparent_temperature[k]),
      humidity: h.relative_humidity_2m[k],
      wind: round(h.wind_speed_10m[k]),
      rain: h.precipitation_probability[k] ?? 0,
      ...describe(h.weather_code[k], h.is_day[k]),
    })),
    daily: d.time.map((iso, i) => ({
      iso,
      name: longDate(iso, { weekday: 'short' }),
      max: round(d.temperature_2m_max[i]),
      min: round(d.temperature_2m_min[i]),
      rain: d.precipitation_probability_max[i] ?? 0,
      wind: round(d.wind_speed_10m_max[i]),
      sunrise: hhmm(d.sunrise[i]),
      sunset: hhmm(d.sunset[i]),
      ...describe(d.weather_code[i], 1),
    })),
  };
}

// The weather as the pages should see it at a given local date and time.
// Close to the fetch time it uses the measured current conditions; for a later time
// (a pre-drawn slot) it uses that hour's forecast, and "today" becomes that day.
export function weatherAt(f, iso, minutes) {
  let off = f.daily.findIndex((x) => x.iso === iso);
  if (off < 0) off = 0;
  const target = `${iso}T${String(Math.floor(minutes / 60)).padStart(2, '0')}:00`;
  const fetchedMin = Date.parse(f.fetchedAt + 'Z') / 60000;
  const targetMin = Date.parse(`${iso}T00:00Z`) / 60000 + minutes;
  let current = f.now;
  if (Math.abs(targetMin - fetchedMin) > 45) {
    const hr = f.hourly.find((x) => x.time === target);
    if (hr) current = { temp: hr.temp, feels: hr.feels, humidity: hr.humidity, wind: hr.wind, icon: hr.icon, label: hr.label };
  }
  const day = f.daily[off];
  const [y, , dd] = iso.split('-').map(Number);
  return {
    city: f.city,
    updated: f.updated,
    current,
    today: day,
    tomorrow: f.daily[off + 1] ?? day,
    days: f.daily.slice(off, off + 3),
    date: {
      iso,
      day: dd,
      weekday: longDate(iso, { weekday: 'long' }),
      month: longDate(iso, { month: 'long' }),
      year: y,
      sunrise: day.sunrise,
      sunset: day.sunset,
    },
  };
}
