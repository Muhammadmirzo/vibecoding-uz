# W7 — Chat centre

## Status

**Done.** Every BUILD item in `docs/waves/prompts/w7-chat.md` is implemented and covered by unit, route, Telegram, and browser tests. No code work is deferred to a later merge.

Migrations `drizzle/0007_eminent_dazzler.sql` and `drizzle/0008_secret_eternity.sql` are committed but intentionally **not applied** to any live database.

## Spec → implementation → proof

| Spec item | Implementation | Proof |
| --- | --- | --- |
| Conversations, messages, indexes, dedupe, linked lead/user | `src/db/schema/chat.ts`; `src/features/chat/server/chat.service.ts`; `drizzle/0007_eminent_dazzler.sql`, `0008_secret_eternity.sql` | `src/__tests__/w7-chat-service.test.ts` |
| Zod-validated `site_settings.chat` safe defaults | `src/features/chat/contracts.ts`, `src/features/chat/server/settings.service.ts` | `src/__tests__/w7-chat-domain.test.ts` |
| Tiny public launcher, click/hover intent, `#chat`, `data-chat-open`, unread badge, admin exclusion | `src/features/chat/ui/ChatLauncher.tsx`; mounted from `src/app/layout.tsx` | `e2e/chat.spec.ts`, `e2e/chat-visual.spec.ts` |
| Responsive Naqsh panel, safe areas, motion/reduced motion, focus trap, Escape, typing, read receipts, degraded retry, sticky-bar offset | `src/features/chat/ui/ChatPanel.tsx`, `ChatMessageBubble.tsx`, `OfflineLeadForm.tsx`; `src/app/globals.css`; `src/app/kurs/[slug]/StickyBuyBar.tsx` | `e2e/chat-visual.spec.ts`, responsive suite |
| Honest Asia/Tashkent response line and offline lead form | `src/features/chat/domain/office-hours.ts`, `OfflineLeadForm.tsx`, `sendVisitorMessage()` lead creation in `chat.service.ts` | `w7-chat-domain.test.ts`, `w7-chat-service.test.ts`, `e2e/chat-visual.spec.ts` |
| `ChatTransport`, cursor polling, 3s visible / 20s hidden / backoff / 60s launcher checks | `src/features/chat/ui/transport.ts`, `ChatPanel.tsx`, `ChatLauncher.tsx` | `e2e/chat.spec.ts`; transport responses validated with Zod |
| API GET/POST, 2000-char limit, honeypot, 1/s + 60/hour + 10 new conversations/hour, v1 429 | `src/app/api/v1/chat/**`, `src/features/chat/contracts.ts` | `src/__tests__/w7-chat-routes.test.ts` |
| AI `auto`, `assist`, off, external provider, grounded facts, 20-message history, 600 tokens, timeout | `src/features/chat/server/ai-orchestrator.service.ts`, `agents/anthropic.ts`, `agents/site-facts.ts`, `agents/index.ts` | `w7-chat-agent.test.ts`, `w7-chat-domain.test.ts` |
| Persisted per-conversation/global daily caps; failure silently disables AI and alerts a human | AI message ledger + UTC-day count in `chat.service.ts`; policy in `ai-orchestrator.service.ts` | cap/failure branches in `w7-chat-domain.test.ts` |
| Admin-only AI draft and “Yuborish” | Draft marker/DTO filtering in `chat.service.ts`; approval route and UI in `api/v1/admin/chat/drafts/route.ts`, `ThreadView.tsx` | `w7-chat-service.test.ts`, route tests, visual/admin screenshots |
| Telegram outgoing notification, “Saytda ochish”, returned message ID, two-minute admin suppression | `src/lib/telegram/chat-bridge.ts` | `src/__tests__/w7-chat-telegram.test.ts` |
| Telegram reply mapping and admin ID allowlist | `handleTelegramChatReply()` in `chat-bridge.ts`; registration in `src/lib/telegram/bot.ts` | `w7-chat-telegram.test.ts` |
| Admin inbox filters/search/context/quick replies/AI switch/close/assign/mobile stack/5s polling | `src/features/chat/ui/AdminInbox.tsx`, `ConversationList.tsx`, `ThreadView.tsx`, `src/app/admin/chat/page.tsx` | `e2e/chat.spec.ts`, `e2e/chat-visual.spec.ts` |
| Read receipts and accumulated unread counters | `markConversationRead()` and counter SQL in `chat.service.ts`; visitor/admin read routes | `w7-chat-service.test.ts`, visitor↔admin Playwright round trip |
| Audit every admin mutation | Transactional audit writes for reply/status/assign/AI mode/draft/read in `chat.service.ts` | `w7-chat-service.test.ts`, admin route tests |
| MCP-ready `listConversations`, `getThread`, `postReply(actor)` | Exported service functions in `src/features/chat/server/chat.service.ts` | `w7-chat-service.test.ts` |
| Visitor analytics without body text | `chat_open` and `chat_message` calls; stable no-op only in `src/features/analytics/server/track.ts` | route tests; `src/features/analytics/` contains only the required stub |
| API contract reuse | Named request/response schemas and inferred types in `src/features/chat/contracts.ts` | contracts/route tests |

## Admin and visitor API

- `GET /api/v1/chat`
- `GET|POST /api/v1/chat/messages`
- `POST /api/v1/chat/open`
- `POST /api/v1/chat/read`
- `GET|PATCH /api/v1/admin/chat/conversations`
- `POST /api/v1/admin/chat/messages`
- `POST /api/v1/admin/chat/drafts`
- `POST /api/v1/admin/chat/read`

All new handlers are thin, Zod-validated, return the shared v1 envelope, and admin mutations use `requireAdmin(request)` so CSRF is enforced.

## Security and antifragility

- 32-byte visitor token; only SHA-256 hash is stored.
- Raw conversation token can be supplied as `X-Visitor-Token`; a token cannot request another conversation ID.
- 2,000-character body, honeypot, 1 message/sec, 60/hour, and 10 new conversations/IP/hour.
- Missing chat migration is quiet for launcher GETs and returns a safe 503 with retained input on send.
- Telegram and AI failures never discard the visitor message.
- AI failures disable the conversation AI mode and notify the human inbox channel.
- Telegram replies store `authorUserId = null`, never a Telegram numeric ID in a UUID FK.
- Every admin mutation writes to `auditLogs` without message body or visitor token.

## Environment variables

Owner must set:

- `ANTHROPIC_API_KEY`
- `TELEGRAM_ADMIN_CHAT_ID`
- `TELEGRAM_ADMIN_USER_IDS` — comma-separated Telegram numeric user IDs

`TELEGRAM_BOT_TOKEN` and the existing session/database variables are also required by the existing Telegram/auth infrastructure.

## Visual review

The visual suite captures and reviews light/dark at 390 and 1440:

- `e2e/screenshots/chat-closed-{390,1440}-{light,dark}.png`
- `e2e/screenshots/chat-open-{390,1440}-{light,dark}.png`
- `e2e/screenshots/chat-conversation-{390,1440}-{light,dark}.png`
- `e2e/screenshots/chat-offline-{390,1440}-{light,dark}.png`
- `e2e/screenshots/admin-chat-{390,1440}-{light,dark}.png`

Review iterations fixed: the top announcement collision, mobile full-sheet coverage, duplicate offline composers, AI draft leakage into visitor mocks, missing selected desktop inbox state, and the Next dev overlay in visual captures. The panel reserves the course `StickyBuyBar` height on mobile.

## Verification

- `npx tsc --noEmit` ✅
- `npx vitest run` ✅ — 73 files, 537 tests
- `scripts/waves/locked.sh npm run build` ✅ — 99 static/dynamic pages generated
- `scripts/waves/locked.sh env E2E_PORT=3305 npx playwright test e2e/chat.spec.ts` ✅ — visitor → inbox → visitor round trip
- `scripts/waves/locked.sh env E2E_PORT=3305 npx playwright test e2e/responsive.spec.ts e2e/visibility.spec.ts` ✅ — 142 tests
- `scripts/waves/locked.sh env E2E_PORT=3305 npx playwright test e2e/chat-visual.spec.ts` ✅ — 4 tests, all required captures
- Lighthouse mobile on `/`, devtools throttling ✅ — performance 90, **LCP 2.232s**, **CLS 0**, FCP 1.801s, TBT 327ms

## First Load JS delta

Measured against a clean production build of pre-W7 commit `9c29eab`. Current public route First Load JS is **never larger**; the delta is 0 or approximately -1 kB (measurement rounding), so the maximum growth is **0 kB ≤ 1.5 kB**.

| Public route | Pre-W7 | W7 | Delta |
| --- | ---: | ---: | ---: |
| `/` | 129 kB | 128 kB | -1 kB |
| `/atamalar` | 128 kB | 127 kB | -1 kB |
| `/bepul-dars` | 119 kB | 118 kB | -1 kB |
| `/blog` | 129 kB | 129 kB | 0 |
| `/blog/[slug]` | 114 kB | 113 kB | -1 kB |
| `/design-system` | 126 kB | 125 kB | -1 kB |
| `/diagnostika` | 120 kB | 120 kB | 0 |
| `/ekspertlar` | 124 kB | 123 kB | -1 kB |
| `/ish` | 154 kB | 153 kB | -1 kB |
| `/ish/[slug]` | 125 kB | 124 kB | -1 kB |
| `/kabinet` | 141 kB | 141 kB | 0 |
| `/kabinet/baholar` | 136 kB | 136 kB | 0 |
| `/kabinet/kurs/[id]/dars/[lessonId]` | 144 kB | 144 kB | 0 |
| `/kabinet/referral` | 154 kB | 153 kB | -1 kB |
| `/kabinet/sertifikat` | 124 kB | 124 kB | 0 |
| `/kabinet/sozlamalar` | 160 kB | 160 kB | 0 |
| `/kabinet/to-lovlar` | 159 kB | 159 kB | 0 |
| `/kurs/[slug]` | 123 kB | 123 kB | 0 |
| `/maxfiylik` | 124 kB | 123 kB | -1 kB |
| `/meetlar` | 127 kB | 127 kB | 0 |
| `/offerta` | 124 kB | 123 kB | -1 kB |
| `/portfolio` | 134 kB | 133 kB | -1 kB |
| `/pul-qaytarish` | 124 kB | 123 kB | -1 kB |
| `/resurslar` | 127 kB | 127 kB | 0 |
| `/testimoniyalar` | 130 kB | 130 kB | 0 |
| `/xizmatlar` | 127 kB | 127 kB | 0 |

## Deployment note

Apply the two committed additive migrations during the orchestrator's normal migration step, configure the three W7 environment variables, and run the gate once more against the migrated target. No push or deployment was performed from this worktree.
