#!/bin/sh
# Usage: start.sh test|loop
# Runs dash.sh detached, so it keeps going after the scriptlet that launched it returns.
#
# It runs from a copy in /tmp (Kindle RAM), not from /mnt/us. When the Kindle is plugged into a
# computer it stops every program holding a file open on /mnt/us before sharing that storage over
# USB, and a script running from /mnt/us (or logging there through an open file) counts.
DIR="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-loop}"
RUN=/tmp/weatherdash-run
PIDFILE=/tmp/weatherdash.pid

# Stop a dashboard that is already running, so starting twice doesn't run two loops.
if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  kill "$(cat "$PIDFILE")" 2>/dev/null
fi

mkdir -p "$RUN"
cp "$DIR/dash.sh" "$RUN/dash.sh"
echo "$(date '+%Y-%m-%d %H:%M:%S') start.sh $MODE launched" >> "$DIR/dash.log"

cd /
export WEATHERDASH_DIR="$DIR"
if command -v setsid >/dev/null 2>&1; then
  setsid sh "$RUN/dash.sh" "$MODE" >/dev/null 2>&1 < /dev/null &
else
  nohup sh "$RUN/dash.sh" "$MODE" >/dev/null 2>&1 < /dev/null &
fi
echo $! > "$PIDFILE"
