#!/bin/sh
# Usage: start.sh test|loop
# Runs dash.sh detached, so it keeps going after the scriptlet that launched it returns.
DIR="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-loop}"
echo "$(date '+%Y-%m-%d %H:%M:%S') start.sh $MODE launched" >> "$DIR/dash.log"
if command -v setsid >/dev/null 2>&1; then
  setsid sh "$DIR/dash.sh" "$MODE" >>"$DIR/dash.log" 2>&1 < /dev/null &
else
  nohup sh "$DIR/dash.sh" "$MODE" >>"$DIR/dash.log" 2>&1 < /dev/null &
fi
