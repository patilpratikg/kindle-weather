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
    forecast_days: '3',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}: ${await res.text()}`);
  return shape(await res.json(), cfg);
}

const round = (n) => Math.round(n);
const hhmm = (iso) => iso.slice(11, 16);

function shape(raw, cfg) {
  const { current: c, hourly: h, daily: d } = raw;

  // Open-Meteo returns local times without an offset, e.g. "2026-11-21T14:15".
  const nowHour = c.time.slice(0, 13) + ':00';
  let start = h.time.indexOf(nowHour);
  if (start < 0) start = 0;
  start += 1; // begin with the next full hour

  const hours = [];
  for (let i = 0; i < cfg.hourlySlots; i++) {
    const k = start + i * cfg.hourlyStep;
    if (k >= h.time.length) break;
    hours.push({
      time: hhmm(h.time[k]),
      temp: round(h.temperature_2m[k]),
      rain: h.precipitation_probability[k] ?? 0,
      ...describe(h.weather_code[k], h.is_day[k]),
    });
  }

  const day = (i) => ({
    max: round(d.temperature_2m_max[i]),
    min: round(d.temperature_2m_min[i]),
    rain: d.precipitation_probability_max[i] ?? 0,
    wind: round(d.wind_speed_10m_max[i]),
    ...describe(d.weather_code[i], 1),
  });

  const [y, m, dd] = d.time[0].split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, dd));

  return {
    city: cfg.city,
    updated: new Intl.DateTimeFormat('en-GB', {
      timeZone: cfg.timezone, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date()),
    current: {
      temp: round(c.temperature_2m),
      feels: round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      wind: round(c.wind_speed_10m),
      ...describe(c.weather_code, c.is_day),
    },
    today: day(0),
    tomorrow: day(1),
    days: d.time.slice(0, 3).map((iso, i) => ({
      iso,
      name: new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }),
      ...day(i),
    })),
    hours,
    date: {
      iso: d.time[0],
      day: dd,
      weekday: date.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }),
      month: date.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' }),
      year: y,
      sunrise: hhmm(d.sunrise[0]),
      sunset: hhmm(d.sunset[0]),
    },
  };
}
