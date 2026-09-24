You are a senior security-minded full-stack engineer continuing wave W2 on branch wave/w2-telegram. Work autonomously until done.
FIRST read: docs/waves/reports/W2-TELEGRAM.md, `git log -3 --stat`, src/features/auth/server/telegram-login.*, src/lib/telegram/handlers/{start,contact}.ts, their tests in src/__tests__/w2-telegram/.

The orchestrator approved round 2 but found one security hole: DEVICE-CODE PHISHING. An attacker clicks "Telegram orqali davom etish" on their own browser, sends the victim the deep link ("bonus oling!"). Victim taps Start → today an already-linked account is approved immediately (and a new user is approved right after sharing the contact) → the ATTACKER's browser receives the victim's session.

FIX — explicit confirmation step in the bot, for every path:
1. `/start login_<token>`: bind the request to from.id (as now) but never approve here.
   - Linked user → send confirmation message: "🔐 {BRAND.name} saytiga kirish so'rovi\n🕒 {HH:mm, Asia/Tashkent}\n💻 {short device from stored user-agent, e.g. "Chrome · Windows"}\n\nAgar hozir saytda o'zingiz «Telegram orqali davom etish» tugmasini bosgan bo'lsangiz — tasdiqlang. Aks holda bu so'rovni rad eting va havolani hech kimga yubormang." with inline buttons "✅ Ha, bu men" (callback `tgl:y:<requestId>`) and "❌ Men emas" (`tgl:n:<requestId>`).
   - Not linked → ask for contact as now; after a valid owned contact → link/create user (as now, same transaction) but leave the request `pending` + bound, then send the SAME confirmation message.
2. Callback handler: verify callback from.id === request.tg_user_id, request pending + unexpired + bound user present → `y` approves (atomic, single use), edits the message to "✅ Tasdiqlandi. Saytga qayting." with the URL button; `n` marks the request `rejected` (add status value; UI shows "So'rov rad etildi" and stops polling), edits the message to "Rad etildi. Hisobingiz xavfsiz." Always `answerCbQuery`. Expired/foreign/used → friendly message, no state change.
3. Callback data ≤ 64 bytes; request ids are UUIDs (fits). Idempotent under Telegram retries (double tap → second is a no-op message).
4. /status: map `rejected` → `{ state: "rejected" }`; TelegramAuthFlow shows a clear Uzbek message + "Qayta boshlash" button.
5. User-agent parsing: tiny local helper (no dependency), fall back to "Noma'lum qurilma"; never echo raw UA (it is attacker-controlled) — only whitelisted browser/OS words.
6. Tests: linked user /start does NOT approve; confirm by the right user approves; confirm by another Telegram user rejected; "Men emas" → rejected → status rejected; double confirm idempotent; expired confirm; new-user contact path ends in confirmation (not approval). Update the report ("Round 3 — phishing hardening").
Port 3203; stop ONLY with `kill $(lsof -t -i:3203)` — NEVER `pkill -f`. No Playwright.
GATE: tsc, vitest, build green. Commit: `git add -A && git commit -m "fix(auth): explicit Telegram login confirmation (anti-phishing)"`. Do not push.
