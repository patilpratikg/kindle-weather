# Published every 30 min (06:07-21:37) by the GitHub Actions workflow in this repo.
IMAGE_URL="https://patilpratikg.github.io/kindle-weather/dashboard.png"

# Seconds between refreshes during the day.
INTERVAL=1800

# Night pause (Kindle's local time, HH:MM). After NIGHT_START the Kindle sleeps straight through
# to WAKE_AT instead of waking every 30 minutes. GitHub stops drawing at night too; its first
# morning image is ready at about 06:07, so WAKE_AT is a little after that.
NIGHT_START=22:00
WAKE_AT=06:15

# Real-time clock used to wake from deep sleep. Try /dev/rtc0 if rtc1 does not wake the device.
RTC_DEV=/dev/rtc1

# Battery badge position in pixels (top-left corner of the 104x28 badge image).
# The dashboard leaves this spot in the header blank for it.
BATTERY_X=474
BATTERY_Y=16

# Plain-text fallback position in eips character cells, used only if the badge can't be drawn.
# On this 600px-wide screen eips cells are 16px wide, so there are 37 columns (0-36).
BATTERY_COL=30
BATTERY_ROW=0
