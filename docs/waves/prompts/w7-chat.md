You are a senior full-stack engineer + product designer who has shipped Intercom/Crisp-class messaging. Work autonomously until fully done.

FIRST read `docs/waves/PHASE2-RULES.md` (mandatory rules) and `docs/waves/API-CONTRACT.md` (use `src/lib/api/v1/respond.ts`), then:
- `src/db/schema/*` (users, leads, site_settings);
- `src/lib/telegram/**` (especially `handoff.ts` and the `TELEGRAM_ADMIN_CHAT_ID` usage), `src/app/api/telegram/webhook/**`;
- `src/features/motion/**` (the motion flags the widget must respect), `src/app/admin/**` layout and nav, `src/app/layout.tsx`;
- the existing lead / "xabar qoldirish" forms;
- `src/features/analytics/server/track.ts` if it exists. If it does not exist yet, create a no-op `trackServerEvent` stub with the SAME signature described in `docs/waves/prompts/w8a-analytics.md` §5 so the orchestrator can merge both.

Wave id: W7. Branch `wave/w7-chat`. Your dev port: **3305**. Report: `docs/waves/reports/W7-CHAT.md`.

OWNER REQUEST: "Make the website's messaging / leave-a-message section work perfectly: visitors chat with the admin, and when I want, I can plug in AI agents to answer. Maximal creative and user-friendly."

BUILD:
1. **Data** in `src/db/schema/chat.ts`:
   - `chat_conversations`: id; visitor_token_hash; user_id nullable; lead_id nullable; display_name; contact_phone/contact_telegram (optional, user-provided); status open|pending|closed; assigned_admin_id; ai_mode off|assist|auto; last_message_at; unread_for_admin; unread_for_visitor; source_path; device; created_at.
   - `chat_messages`: id; conversation_id; client_id (dedupe); sender visitor|admin|ai|system; author_user_id; body (≤ 2000 chars, plain text, rendered escaped with auto-linked URLs only); telegram_message_id nullable; created_at; read_at.
   - Settings stored in `site_settings` key `chat`, Zod-validated with safe defaults:
     - `enabled`, `welcomeText`, `officeHours` (tz Asia/Tashkent), `offlineText`;
     - `aiDefaultMode`, `aiModel` (default `claude-sonnet-5`, cheaper alternative `claude-haiku-4-5-20251001`), `aiDailyReplyCap`, `aiPersona`;
     - `telegramNotify`, `quickReplies[]`.
2. **Visitor widget** (public, every page except `/admin`):
   - Tiny launcher island (≤ 1 kB added to First Load JS). The full panel is dynamic-imported on first click or hover-intent.
   - Beautiful Naqsh-branded panel: bottom-right on desktop, full-height sheet on mobile with safe-area insets. Must not collide with sticky buy bars or cookie UI; check `StickyBuyBar`.
   - Features:
     - welcome text and "Odatda X daqiqada javob beramiz" (only if true per office hours);
     - quick-start chips ("Kurs tanlashda yordam", "To'lov savoli", "Bepul dars");
     - typing indicator for admin/AI, read receipts, timestamps, unread badge on the launcher;
     - sound off by default;
     - offline mode ("Hozir oflaynmiz — raqamingizni qoldiring, Telegram orqali javob beramiz") that captures name + phone or Telegram and creates/links a `leads` row (this IS the new "xabar qoldirish");
     - graceful degraded state if the API is down (the message stays in the textarea, retry button).
   - Keyboard accessible, focus trap, `aria-live` for new messages, Escape closes, respects reduced motion and the admin motion flags.
   - Micro-interactions: spring open, message bubbles slide in, send-button press.
   - Deep link: any CTA with `data-chat-open` or the `#chat` hash opens the panel.
   - The conversation persists across pages and reloads via the httpOnly visitor cookie. A logged-in user's conversation links to their account.
3. **Transport**: HTTP polling with backoff through a `ChatTransport` interface, so we can swap in Supabase Realtime later without touching UI.
   - Poll every 3 s while the panel is open and the tab is visible, every 20 s when hidden, and stop when closed. The launcher checks unread every 60 s only if a conversation exists.
   - `GET /api/v1/chat/messages?after=<cursor>` returns only new messages. Send uses `POST /api/v1/chat/messages` with client_id dedupe (Idempotency).
4. **Admin inbox** `/admin/chat` (+ sidebar entry with a live unread badge):
   - Conversation list with filters (Ochiq / Javob kutmoqda / Yopilgan / Menga biriktirilgan) and search.
   - Thread view with visitor context: source page, device, first seen, linked lead/user, contact.
   - Reply box with quick replies and Ctrl+Enter.
   - Actions: close/reopen, assign, per-conversation AI mode switch (O'chiq / Yordamchi = AI drafts, admin approves / Avto = AI answers).
   - Desktop split view, mobile stack view. Polling 5 s.
5. **Telegram bridge** (reuse the existing bot):
   - A new visitor message (when no admin is active in the inbox in the last 2 min) sends a notification to `TELEGRAM_ADMIN_CHAT_ID` with visitor name, page and message, plus an inline "Saytda ochish" link.
   - The admin can REPLY IN TELEGRAM by replying to that notification. The webhook maps `reply_to_message.message_id` → conversation and posts the reply as an admin message.
   - Only Telegram user ids listed in env `TELEGRAM_ADMIN_USER_IDS` may reply this way.
   - Telegram down → the chat still works.
6. **AI agent** (pluggable): interface `ChatAgentProvider { id; generateReply(ctx): Promise<{ text, handoff: boolean }> }` in `src/features/chat/server/agents/`.
   - Implement `AnthropicChatAgent` using the official `@anthropic-ai/sdk` (add it) with env `ANTHROPIC_API_KEY`. Model comes from settings.
   - Grounding: the system prompt is built ONLY from real site data (courses, prices and dates from `src/features/courses/content` and `siteConfig`, FAQ rows, refund policy text). Rules: answer in the visitor's language (Uzbek default), never invent prices/discounts/guarantees, short friendly answers, and hand off to a human when unsure or when the visitor asks for a person.
   - Limits: at most 20 messages of history, max_tokens ~600, a timeout, and per-conversation plus global daily reply caps.
   - No API key or provider error → AI silently becomes "off" and a human is notified. The AI never blocks the visitor.
   - `assist` mode stores a draft visible only to admins, with an "Yuborish" button.
   - Also expose `ExternalAgentProvider`: conversations in mode `auto` with provider `external` wait for an external AI agent to answer through the API. W8B will add MCP tools `chat_list_open`, `chat_reply`, so design the service functions for that: `listConversations`, `getThread`, `postReply(actor)`.
7. **Security & abuse**:
   - Zod everywhere; body ≤ 2000 chars; honeypot field.
   - Rate limits via `checkRateLimit`: visitor 1 msg/s burst 5, 60/hour; new conversations per IP 10/hour.
   - Visitor endpoints are authorized ONLY by the visitor token; admin endpoints use `requireAdmin` + CSRF. Tokens are 32 random bytes and the DB stores only the hash.
   - Nobody can read another conversation. Audit log on admin actions.
8. **Analytics hooks**: `trackServerEvent` for chat_open / chat_message (visitor side only, no body text).
9. **API** under `/api/v1/chat/*` (visitor) and `/api/v1/admin/chat/*` (admin), with Zod contracts in `src/features/chat/contracts.ts` so W9 can publish OpenAPI and the mobile app can reuse them.

TESTS: services (conversation lifecycle, dedupe, unread counters, AI modes incl. provider failure → handoff, caps), routes (401/403/404 cross-conversation access, 429, validation), Telegram reply mapping + admin-id allowlist, and a Playwright test (open widget, send message, see it in the admin inbox with a seeded admin session, or mocked if seeding is not possible).
BUDGET: every public page's First Load JS grows ≤ 1.5 kB. Lighthouse mobile on `/` (devtools throttling, through the lock): CLS 0, LCP ≤ 2.5 s.
REPORT must list the env vars the owner must set: `ANTHROPIC_API_KEY`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_ADMIN_USER_IDS`.
