// Current air quality from Open-Meteo (free, no key). Returns null if unavailable,
// so pages simply hide the air-quality box instead of failing.
const LEVELS = [
  [50, 'Good', 'Fresh air today.'],
  [100, 'Moderate', 'Fine for outdoor play.'],
  [150, 'Unhealthy for kids', 'Keep outdoor play short.'],
  [200, 'Unhealthy', 'Play indoors today.'],
  [300, 'Very unhealthy', 'Stay indoors, windows closed.'],
  [Infinity, 'Hazardous', 'Stay indoors, windows closed.'],
];

export async function fetchAirQuality(cfg) {
  try {
    const params = new URLSearchParams({
      latitude: cfg.latitude, longitude: cfg.longitude, timezone: cfg.timezone, current: 'us_aqi,pm2_5',
    });
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
    if (!res.ok) return null;
    const { current } = await res.json();
    const aqi = Math.round(current.us_aqi);
    if (!Number.isFinite(aqi)) return null;
    const [, label, advice] = LEVELS.find(([max]) => aqi <= max);
    return { aqi, label, advice, pm25: Math.round(current.pm2_5) };
  } catch {
    return null;
  }
}
