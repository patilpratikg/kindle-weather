# Kindle weather dashboard (Pune)

Turns a jailbroken Kindle into a wall-mounted weather display. GitHub renders a 600×800 grayscale
PNG every 30 minutes. The Kindle wakes up, downloads it over Wi-Fi, shows it, and deep-sleeps.
Nothing at home has to stay on.

```
Open-Meteo API ──► GitHub Actions (every 30 min) ──► GitHub Pages: dashboard.png ──► Kindle (Wi-Fi, curl + eips)
```

## Project layout

| Path | What it does |
|---|---|
| `config.json` | City, coordinates, timezone, screen size |
| `src/weather.js` | Fetches the Open-Meteo forecast (no API key) and maps weather codes to labels/icons |
| `src/icons.js` | Line-art weather icons drawn for e-ink |
| `src/template.js` | The dashboard layout (HTML/CSS) |
| `src/render.js` | Renders HTML → screenshot → 8-bit grayscale PNG in `out/` |
| `.github/workflows/render.yml` | Runs the render every 30 min and publishes `out/` to GitHub Pages |
| `kindle/weatherdash/` | Dashboard scripts for the Kindle (`/mnt/us/weatherdash`) |
| `kindle/documents/` | Scriptlets that start the dashboard from the Kindle library |

## 1. Preview on your PC

```powershell
npm install
npm run render
```

This writes `out/dashboard.png` (the Kindle image) and `out/preview.html`. Change the layout in
`src/template.js` and run it again.

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

These scripts have not been tested on real hardware yet. Things you may need to adjust in `config.sh`:

- **Battery text in the wrong place:** change `BATTERY_COL` / `BATTERY_ROW`.
- **Never wakes up / only refreshes while plugged in:** try `RTC_DEV=/dev/rtc0`.
- **Download fails:** check `weatherdash/dash.log` on the Kindle drive.

## Changing city

Edit `city`, `latitude`, `longitude` and `timezone` in `config.json`, then push.
