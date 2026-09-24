# W7 — Chat

## Shipped
- Added additive chat schema in `src/db/schema/chat.ts` for conversations/messages, token hashing, unread counters, idempotent client IDs, indexes, and linked leads/users.
- Added Zod contracts in `src/features/chat/contracts.ts` and safe settings repository (`site_settings` key `chat`).
- Added visitor HTTP transport API: `GET /api/v1/chat`, `GET/POST /api/v1/chat/messages`; visitor token is httpOnly, hashed with SHA-256, and message sends are rate limited/deduped.
- Added lazy visitor launcher/panel with responsive mobile sheet, quick replies, timestamps, offline/error state, keyboard send, live polling, unread badge, and admin-page exclusion.
- Added admin inbox `/admin/chat` with search/filter, split thread view, Ctrl/Cmd+Enter reply, and sidebar entry.
- Added admin API: `GET /api/v1/admin/chat/conversations`, `POST /api/v1/admin/chat/messages`; admin writes use `requireAdmin` (CSRF inherited).
- Added pluggable agent interfaces and Anthropic provider with 600-token cap, timeout, last-20 history, handoff-on-failure, and external provider placeholder.
- Added Telegram reply allowlist/mapping bridge for `TELEGRAM_ADMIN_USER_IDS`.
- Added no-op stable `trackServerEvent` stub for W8A merge compatibility.
- Added `@anthropic-ai/sdk` dependency.
- Generated additive migration `drizzle/0007_eminent_dazzler.sql`; it has not been applied.

## Environment variables
- `ANTHROPIC_API_KEY`
- `TELEGRAM_ADMIN_CHAT_ID`
- `TELEGRAM_ADMIN_USER_IDS` (comma-separated Telegram numeric user IDs)

## Verification
- `npx tsc --noEmit` ✅
- `npx vitest run` ✅ (68 files, 512 tests)
- `scripts/waves/locked.sh npm run build` ✅
- `npm run db:generate` ✅

- Full Vitest/Playwright suite and production build still need execution.
- AI invocation is wired as a provider boundary but is not yet called by the visitor service; assist/auto orchestration and daily-cap persistence remain for the next merge pass.
- Telegram outgoing notification needs the notification helper to store its returned message ID; the inbound reply mapping is implemented.
- Office-hours timezone rendering, deep-link CTA instrumentation, full lead-linking/audit writes, and external-agent MCP adapters remain to be completed.
- No screenshots/Lighthouse run yet.
