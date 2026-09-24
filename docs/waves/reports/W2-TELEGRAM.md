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
- `npx vitest run` — pass: 58 files, 465 tests passed, 1 skipped
- `npm run build` — pass, 88 routes generated
- `npm run db:generate` — generated migration; no database migration was run

## Owner manual test after database is restored

1. Set the Telegram bot token/handle and deploy migration `0004_glorious_ozymandias.sql`.
2. Open the auth modal as an unregistered Telegram user; click **Telegram orqali davom etish**.
3. Open the deep link, press Start, share the phone via **📱 Raqamni ulashish**, then return to the site.
4. Confirm the new student is created, the audit row says `signup.telegram`, and the session cookie logs in without a hard reload.
5. Repeat with an already-linked account; confirm it approves immediately. Repeat an old link and a second status poll; confirm it is rejected/single-use.
6. Verify the phone/OTP alternative remains available if the database is unavailable.

## Risks / follow-up

- The bot process must be restarted after deploying the handler code and must share the same database/session environment as the web app.
- The desktop QR is a small dependency-free visual fallback; a production scannable QR encoder can replace it without changing the API.
- Existing request state is per database row; the contact token handoff is held in bot memory, so a bot restart requires starting a new site login attempt.
