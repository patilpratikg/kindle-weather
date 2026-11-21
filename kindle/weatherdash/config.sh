# Published every 30 min by the GitHub Actions workflow in this repo.
IMAGE_URL="https://patilpratikg.github.io/kindle-weather/dashboard.png"

# Seconds between refreshes. Match the GitHub Actions schedule (30 min).
INTERVAL=1800

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
