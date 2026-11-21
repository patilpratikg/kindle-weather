# Kindle weather dashboard (Baner, Pune)

Turns a jailbroken Kindle into a wall-mounted family display: weather, a sight word of the day
for an early reader, and a different page for each part of the day. GitHub renders a 600×800 grayscale
PNG every 15 minutes from 06:07 to 21:52. Every 30 minutes the Kindle wakes up, downloads it over Wi-Fi,
shows it, and deep-sleeps; from 22:00 it sleeps straight through to 06:15.
Nothing at home has to stay on.

```
Open-Meteo API ──► GitHub Actions (every 15 min) ──► GitHub Pages: dashboard.png ──► Kindle (Wi-Fi, curl + eips)
```

## Project layout

| Path | What it does |
|---|---|
| `config.json` | City, coordinates, timezone, screen size |
| `src/weather.js` | Fetches the Open-Meteo forecast (no API key) and maps weather codes to labels/icons |
| `src/icons.js` | Line-art weather icons drawn for e-ink |
| `src/pages.js` | The six pages: main, morning, reading, bedtime, weekend, festival |
| `src/schedule.js` | Picks the page from the local time (rules in `config.json` → `schedule`) |
| `src/common.js`, `src/art.js` | Shared fonts, page shell, sight-word card, line-art pictures |
| `src/airquality.js`, `src/moon.js` | Air quality (Open-Meteo) and moon phase |
| `src/family.js` | Reads `data/` and turns weather into advice (what to wear, outing ideas) |
| `data/family.json` | **You edit this:** morning jobs, countdowns, weekend plans, outing ideas, wake time |
| `data/festivals.json` | **You edit this:** festival dates that get a themed page |
| `src/sightwords.js` | Sight word of the day: 92 Dolch pre-primer and primer words, each with a short sentence |
| `src/render.js` | Renders HTML → screenshot → 8-bit grayscale PNG in `out/` |
| `.github/workflows/render.yml` | Runs the render every 15 min and publishes `out/` to GitHub Pages |
| `kindle/weatherdash/` | Dashboard scripts for the Kindle (`/mnt/us/weatherdash`) |
| `kindle/documents/` | Scriptlets that start the dashboard from the Kindle library |

## 1. Preview on your PC

```powershell
npm install
npm run render
```

This writes `out/dashboard.png` (the page for right now) and `out/preview.html`. To see every page:
`$env:PAGE="all"; npm run render` writes them all to `out/pages/`. To force one page:
`$env:PAGE="bedtime"; npm run render`.

The battery badge in the header is drawn by the Kindle itself, from pre-rendered images in
`kindle/weatherdash/battery/` (one per level, 0–100), or `battery-dark/` when the published
`theme.txt` says `dark` (the black bedtime page). The dashboard leaves that corner blank. To
change the badge's look, edit `tools/battery-icons.mjs`, run `npm run battery-icons`, and copy the
`battery/` and `battery-dark/` folders to the Kindle again.

## 2. Publish with GitHub (free)

1. Create a new **public** GitHub repo named `kindle-weather` and push this folder to it.
2. Go to the repo's **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Open **Actions → Render dashboard → Run workflow** once.
4. The image is now at `https://<your-username>.github.io/kindle-weather/dashboard.png`.

GitHub turns off scheduled workflows in repos with no activity for 60 days. If the image stops
updating, re-enable the workflow on the Actions tab.

## 3. Jailbreak the Kindle (done)

This Kindle (7th gen, firmware 5.12.2.2) was jailbroken with WinterBreak2. Modern jailbreaks block
updates automatically and run apps as **scriptlets**: `.sh` files in `documents/` that show up in
the library like books. The hotfix and KUAL are no longer needed (KUAL no longer works).

## 4. Install the dashboard on the Kindle

Connect the Kindle by USB and copy:

| From this repo | To the Kindle drive |
|---|---|
| `kindle/weatherdash/` | `weatherdash/` |
| `kindle/documents/weather-test.sh`, `weather-start.sh` | `documents/` |

Scripts must keep Unix (LF) line endings. `.gitattributes` enforces that.

1. **Test the screen:** in the library, open **Weather Dashboard - Test**. Until `IMAGE_URL` is set,
   it shows the bundled `sample.png` without using Wi-Fi.
2. **Point it at your image:** set `IMAGE_URL` in `weatherdash/config.sh` to your Pages URL, then run
   the test again to check the download.
3. **Start it:** open **Weather Dashboard - Start**. The reader UI stops, and the screen refreshes
   every 30 minutes.

**To exit:** hold the power button for about 40 seconds. The Kindle restarts normally, because the
dashboard does not start automatically.

## Tuning on the device

Tested on a Kindle 7th gen (firmware 5.12.2.2): the test mode, image display and battery badge work.
Every run writes a step-by-step log to `weatherdash/dash.log` on the Kindle drive. Settings in
`config.sh`:

- **Battery badge in the wrong place:** change `BATTERY_X` / `BATTERY_Y` (pixels).
- **Never wakes up / only refreshes while plugged in:** try `RTC_DEV=/dev/rtc0`.
- **Download fails:** check `dash.log`. It records curl's error.

## Pages

The page is chosen by Pune time; the first matching rule wins:

| Page | When | What's on it |
|---|---|---|
| Bedtime | 20:00–06:00 every day | Black calm page: real moon phase, today's and tomorrow's word, tomorrow's weather, wake-up time |
| Festival | All day on a date in `data/festivals.json` | Themed banner, weather, air quality, sight word, date |
| Weekend | Saturday and Sunday | 3-day forecast, outing idea (outdoor if dry and air is OK), sight word, countdown, weekend plans |
| Morning | School days 06:00–09:00 | What to wear, morning jobs, countdown, today's word |
| Reading | School days 15:00–20:00 | Big word card, spelling, read-alone story, find-the-word puzzle, progress |
| Main | Other weekday hours | Weather, sight word, date |

Change the hours in `config.json` → `schedule`. Edit `data/family.json` on github.com (pencil icon)
to change jobs, countdowns, plans and outings; the Kindle shows it within about 30 minutes.
Festival dates marked `"check": true` follow the Hindu calendar and need confirming.

## Sight word of the day

Every page shows one new sight word a day, in the Andika font (made for early
readers), with a short sentence using it and the previous three words to practise. Words run in
order from `sightWords.startDate` in `config.json` and loop after 92 days. To start over, set
`startDate` to today. To preview another day: `$env:SW_DATE="2026-12-24"; npm run render`.

## Changing city

Edit `city`, `latitude`, `longitude` and `timezone` in `config.json`, then push.
