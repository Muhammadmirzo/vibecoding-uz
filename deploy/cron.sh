#!/bin/sh
# Tiny scheduler sidecar: calls /api/cron/* with CRON_SECRET (same contract as Vercel Crons).
# Runs in alpine (busybox sh + wget). Schedule: deploy/crontab.txt. Times are UTC.
set -eu
: "${CRON_SECRET:?CRON_SECRET is required}"
APP_URL="${APP_URL:-http://app:3000}"
TABLE="${CRONTAB_FILE:-/deploy/crontab.txt}"
last=""
echo "cron sidecar: $(grep -vc '^#' "$TABLE") job(s), target $APP_URL"
while true; do
  now=$(date -u +%H:%M)
  if [ "$now" != "$last" ]; then
    last=$now
    h=${now%:*}
    m=${now#*:}
    grep -v '^#' "$TABLE" | while read -r cm ch path; do
      [ -n "${path:-}" ] || continue
      if { [ "$cm" = "*" ] || [ "$cm" = "$m" ]; } && { [ "$ch" = "*" ] || [ "$ch" = "$h" ]; }; then
        code=$(wget -q -S -O /dev/null -T 300 --header "Authorization: Bearer $CRON_SECRET" "$APP_URL$path" 2>&1 \
          | awk '/^ *HTTP\//{c=$2} END{print c}')
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $path -> ${code:-no response}"
      fi
    done
  fi
  sleep 20
done
