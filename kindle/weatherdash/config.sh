# GitHub draws this at :25 and :55 (05:55-21:25), for the Kindle's next refresh.
IMAGE_URL="https://patilpratikg.github.io/kindle-weather/dashboard.png"

# Refresh every 30 minutes, lined up with the clock: the Kindle wakes exactly at :00 and :30.
INTERVAL=1800

# Night pause (Kindle's local time, HH:MM). Wake-ups from NIGHT_START until WAKE_AT are skipped:
# after the 21:30 refresh the Kindle sleeps straight through to 06:00.
NIGHT_START=22:00
WAKE_AT=06:00

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
