#!/usr/bin/env bash
# Sends a short failure notice to the owner's Telegram (no secrets, no data). Silent if not configured.
set -uo pipefail
[ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_ADMIN_CHAT_ID:-}" ] || { echo "Telegram alert not configured"; exit 0; }
url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
curl -fsS -o /dev/null -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_ADMIN_CHAT_ID}" \
  --data-urlencode "text=⚠️ Naqsh: $1. $url" || echo "Telegram alert could not be sent"
