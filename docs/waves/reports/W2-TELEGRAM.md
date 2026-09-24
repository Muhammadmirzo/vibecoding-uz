# W2 — Telegram deep-link signup + login

## Flow

```text
AuthModal → POST /api/auth/telegram/start
       → httpOnly initiator cookie + t.me/<bot>?start=login_<opaque token>
       → Telegram /start
          ├─ already linked → approve
          └─ new/unlinked → request_contact → ownership check → find phone or create student + audit
       → approve DB request
       → GET /api/auth/telegram/status?id=<uuid> (2s, hidden-tab backoff, 5m TTL)
       → constant-time initiator-cookie check → atomic single-use consume → session cookie
       → AuthContext user refresh without hard reload
```

Expired, unknown, consumed and wrong-cookie requests never reveal approval state. Telegram ownership is checked with `contact.user_id === from.id`; the link payload accepts only `login_` plus URL-safe characters.

## Files

- `src/db/schema/telegram.ts`, `src/db/schema/index.ts`
- `drizzle/0004_glorious_ozymandias.sql` and Drizzle snapshot/journal
- `src/features/auth/server/telegram-login.repository.ts`
- `src/features/auth/server/telegram-login.service.ts`
- `src/app/api/auth/telegram/start/route.ts`
- `src/app/api/auth/telegram/status/route.ts`
- `src/lib/telegram/handlers/start.ts`
- `src/lib/telegram/handlers/contact.ts`
- `src/features/auth/components/TelegramAuthFlow.tsx`
- `src/features/auth/components/AuthModal.tsx`
- `src/features/auth/components/TelegramLoginButton.tsx`
- `src/context/AuthContext.tsx`

## Configuration

- `DATABASE_URL` (required for request persistence and sessions)
- `TELEGRAM_BOT_TOKEN` (server bot)
- `NEXT_PUBLIC_TELEGRAM_BOT_NAME` (public bot handle, defaults from `BRAND`)
- `NEXT_PUBLIC_APP_URL` (return URL; defaults from `BRAND`)
- `NEXT_PUBLIC_TELEGRAM_WIDGET=1` only to enable the legacy widget fallback

The old widget is secondary and falls into the deep-link flow on its 422 `phone_link_required` response.

## Verification

- `npx tsc --noEmit` — pass
- `npx vitest run` — pass: 62 files, 486 tests passed, 1 skipped (21 W2 tests)
- `npm run build` — pass, 88 routes generated
- `npm run db:generate` — generated `0005_flashy_rachel_grey.sql`; no database migration was run

## Owner manual test after database is restored

1. Set the Telegram bot token/handle and deploy migration `0004_glorious_ozymandias.sql`.
2. Open the auth modal as an unregistered Telegram user; click **Telegram orqali davom etish**.
3. Open the deep link, press Start, share the phone via **📱 Raqamni ulashish**, then return to the site.
4. Confirm the new student is created, the audit row says `signup.telegram`, and the session cookie logs in without a hard reload.
5. Repeat with an already-linked account; confirm it approves immediately. Repeat an old link and a second status poll; confirm it is rejected/single-use.
6. Verify the phone/OTP alternative remains available if the database is unavailable.

## Orchestrator review fixes

1. **Broken polling / secret leakage** — the site now stores the UUID returned by `/start` separately from the opaque Telegram deep-link token. `/status` is called with the UUID only; the token is never used as a site URL parameter or poll value.
2. **Fake QR** — `qrcode-generator` with error-correction M, a four-module quiet zone, and a crisp inline SVG path is used. The QR is rendered only for fine pointers at widths of 640px and above, with white background and theme-aware dark modules.
3. **Serverless state** — the in-memory contact map is removed. `/start` binds the pending/unexpired request to `tg_user_id`; contact approval selects the newest pending/unexpired request for that Telegram user in the database.
4. **Polling loop** — one effect owns the loop. It uses the server-provided absolute expiry deadline, 2s → 3s → 5s backoff, pauses on hidden tabs, resumes on `visibilitychange`, aborts requests on cleanup, and keeps the countdown display-only.
5. **Consume order** — status consumption, session-row creation, and session-token signing run in one database transaction. A failed signing/session write rolls back the consumed state.
6. **Bot messages** — interpolated legacy names/phones are HTML-escaped or moved to plain text. Successful contact removes the reply keyboard and sends the inline “Saytga qaytish” button. Telegram/phone conflicts receive a specific Uzbek conflict message.
7. **Cookies** — `/start` and `/status` use `response.cookies.set`; no `Secure=false` attribute is emitted. Approval clears the initiator cookie and sets the normal session cookie.
8. **Antifragility** — database failures return JSON 503. The client guards non-JSON responses, shows the phone fallback message, and focuses the phone input. The status route never depends on a token in its URL.
9. **Auth modal** — the modal says “Kirish yoki ro'yxatdan o'tish”, presents Telegram first and phone/OTP as the alternative, and only shows the legacy widget when `NEXT_PUBLIC_TELEGRAM_WIDGET=1`. After approval it refreshes AuthContext state and closes after approximately 1.2 seconds, honoring a pending safe redirect.
10. **Tests** — service, route, bot-handler, and QR tests cover nonce hashing, DB outage, binding, new/existing/conflicting contacts, expiry/replay/cookie ownership, atomic single-use sessions, route cookies/status codes, handler ownership, and a known QR matrix.

## Owner's manual test steps

1. Apply the W2 migrations (`0004_glorious_ozymandias.sql` and `0005_flashy_rachel_grey.sql`) to Supabase, then restart the web and Telegram bot processes with the same `DATABASE_URL` and bot environment.
2. Set `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_NAME`, and `NEXT_PUBLIC_APP_URL`; do not set `NEXT_PUBLIC_TELEGRAM_WIDGET` unless testing the legacy fallback.
3. In a private browser window, open the auth modal, choose **Telegram orqali davom etish**, and confirm the browser network tab shows `/status?id=<uuid>`, not a `login_<token>` query value.
4. On desktop, scan the displayed QR with a Telegram-enabled phone. On mobile, confirm the Telegram deep link opens. Complete `/start` and share the owned phone.
5. For a new phone, verify a student, `signup.telegram` audit row, approved request, and successful session login. For an existing phone, verify linking. For a Telegram ID already linked to another phone, verify the specific conflict message.
6. Hide the tab during approval and return to it; verify polling pauses and resumes. Confirm the 5-minute countdown, 2/3/5-second retry cadence, and retry button.
7. Poll an approved request twice (or use two concurrent requests): only one session cookie and one successful approval should be returned. A wrong/missing initiator cookie, expired link, or consumed request must not authenticate.
8. Temporarily make the database unavailable: `/start` and `/status` should return JSON 503, the UI should focus the phone field, and phone/OTP should remain available. A non-JSON proxy response must not crash the page.
9. Confirm successful login closes the modal after about 1.2 seconds, refreshes the user without a hard reload, and follows a valid pending `?auth=1&redirect=/...` path.

## Round 3 — phishing hardening

- `/start login_<token>` now binds the request to the tapping Telegram account but never approves it. Linked accounts and new-user contact flows both receive an explicit confirmation message with a whitelisted browser/OS device label (never the raw user-agent).
- Added `tgl:y:<request UUID>` and `tgl:n:<request UUID>` callbacks. Approval is an atomic pending/unexpired/bound-user transition; rejection is a terminal `rejected` transition. Foreign, expired, malformed, and replayed callbacks are no-ops and always receive a friendly callback answer.
- `/status` maps `rejected` to a terminal state, and `TelegramAuthFlow` stops polling with a clear Uzbek security message and a **Qayta boshlash** action.
- Added callback, idempotency, ownership, rejection, expiry, and linked-user confirmation tests.

## Risks / follow-up

- The bot process must be restarted after deploying the handler code and must share the same database/session environment as the web app.
- `qrcode-generator` is a small runtime dependency; the QR encoder and its known-good matrix are covered by Vitest.
- The composite Telegram lookup index is included in migration `0005_flashy_rachel_grey.sql`; apply it with the original request-table migration.
