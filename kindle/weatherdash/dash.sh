#!/bin/sh
# Weather dashboard for a jailbroken Kindle.
#   Installed at /mnt/us/weatherdash and started by the scriptlets in /mnt/us/documents.
#   dash.sh test  -> pause the reader UI, show the image for $TEST_SECONDS, then bring the UI back
#   dash.sh loop  -> stop the reader UI, refresh every $INTERVAL seconds, deep-sleep in between
# To get back to the normal Kindle from loop mode: hold the power button ~40 seconds to restart.

# start.sh runs this from a copy in /tmp and passes the real folder in WEATHERDASH_DIR.
DIR="${WEATHERDASH_DIR:-$(cd "$(dirname "$0")" && pwd)}"
. "$DIR/config.sh"

LOG="$DIR/dash.log"            # on the Kindle drive, readable over USB
TMPLOG=/tmp/weatherdash.log    # always writable, even while plugged into a computer
IMG=/tmp/weatherdash.png
SAMPLE="$DIR/sample.png"
THEME_FILE=/tmp/weatherdash.theme
TEST_SECONDS="${TEST_SECONDS:-45}"

# Each line is written with a short open/close (never a file held open on /mnt/us). While the
# drive is shared over USB, /mnt/us is unavailable: lines go to /tmp and are copied back later.
log() {
  line="$(date '+%Y-%m-%d %H:%M:%S') $*"
  echo "$line" >> "$TMPLOG"
  if [ -s "$TMPLOG.pending" ] && { cat "$TMPLOG.pending" >> "$LOG"; } 2>/dev/null; then
    : > "$TMPLOG.pending"
  fi
  { echo "$line" >> "$LOG"; } 2>/dev/null || echo "$line" >> "$TMPLOG.pending"
}

# Run a command, logging its exit code and any error output.
run() {
  out="$("$@" 2>&1)"
  rc=$?
  log "  \$ $* -> rc=$rc${out:+ | $(echo "$out" | tr '\n' ' ' | cut -c1-200)}"
  return $rc
}

diagnostics() {
  log "diagnostics: firmware=$(cat /etc/prettyversion.txt 2>/dev/null | head -n1)"
  for c in eips fbink curl rtcwake setsid gasgauge-info lipc-get-prop lipc-set-prop stop start; do
    log "  $c: $(command -v "$c" 2>/dev/null || echo missing)"
  done
  log "  rtc devices: $(ls /dev/rtc* 2>/dev/null | tr '\n' ' ')"
}

ui_stop() {
  run stop lab126_gui || run /etc/init.d/framework stop
  sleep 3
}

ui_start() {
  run start lab126_gui || run /etc/init.d/framework start
}

wifi_up() {
  lipc-set-prop com.lab126.cmd wirelessEnable 1 2>/dev/null
  i=0
  while [ $i -lt 45 ]; do
    [ "$(lipc-get-prop com.lab126.wifid cmState 2>/dev/null)" = "CONNECTED" ] && return 0
    sleep 1
    i=$((i + 1))
  done
  log "wifi did not connect"
  return 1
}

wifi_down() {
  lipc-set-prop com.lab126.cmd wirelessEnable 0 2>/dev/null
}

download() {
  # Try with certificate checks first; old firmware may have outdated CA certificates.
  curl -fsS -m 40 -o "$IMG.new" "$IMAGE_URL" 2>>"$TMPLOG" \
    || curl -fsSk -m 40 -o "$IMG.new" "$IMAGE_URL" 2>>"$TMPLOG" \
    || { log "download failed"; return 1; }
  mv "$IMG.new" "$IMG"
  # theme.txt sits next to the image: "dark" on the black bedtime page, otherwise "light".
  t="$(curl -fsS -m 15 "${IMAGE_URL%/*}/theme.txt" 2>/dev/null || curl -fsSk -m 15 "${IMAGE_URL%/*}/theme.txt" 2>/dev/null)"
  case "$t" in dark*) echo dark > "$THEME_FILE" ;; *) echo light > "$THEME_FILE" ;; esac
}

battery() {
  # powerd is the standard source; gasgauge-info and sysfs are fallbacks on some models.
  b="$(lipc-get-prop com.lab126.powerd battLevel 2>/dev/null)"
  [ -z "$b" ] && b="$(gasgauge-info -c 2>/dev/null)"
  [ -z "$b" ] && b="$(cat /sys/class/power_supply/*/capacity 2>/dev/null | head -n1)"
  b="$(echo "$b" | tr -cd '0-9')"
  [ -n "$b" ] && [ "$b" -gt 100 ] && b=100
  echo "$b"
}

draw_battery() {
  level="$(battery)"
  log "battery reading: '${level:-none}'"
  [ -n "$level" ] || return 1
  sleep 1 # let the full-screen image refresh finish first
  # Pre-rendered badge ("87%" + bar) from battery/<level>.png; plain text if that fails.
  # (eips' built-in font has no "%" character.)
  badges="$DIR/battery"
  [ "$(cat "$THEME_FILE" 2>/dev/null)" = dark ] && [ -d "$DIR/battery-dark" ] && badges="$DIR/battery-dark"
  badge="$badges/$level.png"
  if [ -f "$badge" ] && run eips -g "$badge" -x "$BATTERY_X" -y "$BATTERY_Y"; then
    return 0
  fi
  run eips "$BATTERY_COL" "$BATTERY_ROW" "BAT $level"
}

show() {
  [ -f "$IMG" ] || { log "no image to show"; return 1; }
  run eips -c
  # Fall back to FBInk (installed by the jailbreak in /mnt/us/libkh/bin) if eips can't draw the PNG.
  run eips -f -g "$IMG" || run /mnt/us/libkh/bin/fbink -c -f -g file="$IMG"
  draw_battery
}

refresh() {
  case "$IMAGE_URL" in
    *YOUR-GITHUB-USERNAME*)
      # Not configured yet: show the bundled sample so the display path can be tested offline.
      log "IMAGE_URL not set, showing sample"
      cp "$SAMPLE" "$IMG"
      ;;
    *)
      if wifi_up && download; then
        log "updated"
      fi
      ;;
  esac
  show
}

# Minutes since midnight for "HH:MM" (strips leading zeros so "08" isn't read as octal).
hm_to_min() { h="${1%%:*}"; m="${1##*:}"; echo $(( ${h#0} * 60 + ${m#0} )); }

# Seconds to sleep before the next refresh: the normal interval by day, or straight through
# to WAKE_AT if the night pause has started (or the next wake would land inside it).
next_sleep() {
  now=$(( $(date +%H | sed 's/^0//') * 60 + $(date +%M | sed 's/^0//') ))
  night=$(hm_to_min "${NIGHT_START:-22:00}")
  wake=$(hm_to_min "${WAKE_AT:-06:15}")
  next=$(( now + INTERVAL / 60 ))
  in_night() { t=$(( $1 % 1440 )); [ "$t" -ge "$night" ] || [ "$t" -lt "$wake" ]; }
  if in_night "$now" || in_night "$next"; then
    echo $(( ((wake - now + 1440) % 1440) * 60 ))
  else
    echo "$INTERVAL"
  fi
}

deep_sleep() {
  secs="$1"
  start="$(date +%s)"
  if command -v rtcwake >/dev/null 2>&1 && [ -e "$RTC_DEV" ]; then
    rtcwake -d "$RTC_DEV" -m no -s "$secs" >/dev/null 2>&1
    echo mem > /sys/power/state 2>/dev/null
  fi
  # If suspend is unavailable or woke early, wait out the remainder normally.
  left=$((secs - ($(date +%s) - start)))
  [ "$left" -gt 5 ] && sleep "$left"
}

case "$1" in
  test)
    log "=== test start"
    diagnostics
    ui_stop
    refresh
    sleep "$TEST_SECONDS"
    ui_start
    log "=== test end"
    ;;
  loop)
    log "=== loop start"
    diagnostics
    ui_stop
    lipc-set-prop com.lab126.powerd preventScreenSaver 1 2>/dev/null
    while true; do
      refresh
      wifi_down
      secs="$(next_sleep)"
      [ "$secs" -gt "$INTERVAL" ] && log "night pause: sleeping $((secs / 60)) min until ${WAKE_AT:-06:15}"
      deep_sleep "$secs"
    done
    ;;
  *)
    echo "usage: $0 test|loop"
    exit 1
    ;;
esac
