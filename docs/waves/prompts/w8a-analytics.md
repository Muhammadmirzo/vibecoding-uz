You are a senior full-stack + data engineer and product designer. Work autonomously until fully done.

FIRST read `docs/waves/PHASE2-RULES.md` (mandatory rules) and `docs/waves/API-CONTRACT.md` (use `src/lib/api/v1/respond.ts`), then `src/db/schema/*` (users, courses, lessons, lesson_progress, enrollments, cohorts, homework_*, payments, leads, referrals), `src/app/admin/analytics/**`, `src/app/api/admin/analytics/**`, `src/app/api/cron/**`, `src/app/layout.tsx`, `src/lib/security/*`.
Wave id: W8A. Branch `wave/w8a-analytics`. Your dev port: **3304**. Report: `docs/waves/reports/W8A-ANALYTICS.md`.

OWNER REQUEST: "I want to see everything: how many students, lesson completion, attendance, how many sales, how many came, from where, where they entered, where they left, and other key metrics in detail." Today NOTHING is tracked, so every day without tracking is lost data. This wave builds the first-party analytics foundation. The next wave (W8B) exposes it through a world-class MCP server with visual charts, and a later wave exposes it to the mobile app. So the **service layer is the product**: clean, typed, documented, reusable.

BUILD:
1. **Event store** in `src/db/schema/analytics.ts`: `analytics_events`
   - Columns: id uuid, occurred_at timestamptz, received_at, event_id (client uuid, unique, for dedupe), visitor_hash (sha256 of an opaque first-party cookie token, never the raw token), session_id (30-min inactivity rule, client-generated), user_id nullable, type (text, validated by a Zod enum), path, referrer_host, utm_source/medium/campaign/term/content, device (mobile/tablet/desktop), browser family, country (from `x-vercel-ip-country`, else null), props jsonb (whitelisted per type, ≤ 2 KB), value_uzs int nullable.
   - Indexes on (occurred_at), (type, occurred_at), (visitor_hash, occurred_at), (session_id).
   - **No raw IPs, no phone or email in events.**
2. **Event types** (Zod enum in `src/features/analytics/contracts.ts`): page_view, page_leave (with engaged_ms, scroll_depth), cta_click (id), form_start, form_submit, lead_created, diagnostic_start, diagnostic_complete, signup, login, checkout_start, payment_success, payment_failed, lesson_start, lesson_complete, homework_submit, chat_open, chat_message.
3. **Ingestion** `POST /api/v1/events`
   - Accepts a batch of 1–25 events, max 16 KB body, Zod-validated. Response is 202 `{ data: { accepted } }`.
   - Anonymous. Sets or reads the visitor cookie (httpOnly, SameSite=Lax, Secure, 13 months); also accepts the `X-Visitor-Token` header (mobile).
   - Rate-limited and bot-filtered (UA list plus headless markers). Dedupes on event_id.
   - If the DB is down it still returns 202 and drops the batch with a log line. It must never break the page.
   - The `Origin` check allows only the site origin, but mobile header clients have no Origin.
4. **Client tracker** `src/features/analytics/client/tracker.ts`
   - Budget: ≤ 1.5 kB gzip, loaded after hydration with `requestIdleCallback`. **Home First Load JS may grow ≤ 1 kB.**
   - Tracks page_view on route change (App Router), page_leave on `visibilitychange`/`pagehide` via `navigator.sendBeacon`, engaged time and max scroll depth, and CTA clicks through `data-track="<id>"` attributes (add them to the main CTAs: hero, pricing, course buy, diagnostika, bepul-dars, header CTA). UTM params are captured on landing and kept for the session.
   - Respects `navigator.doNotTrack === "1"` / GPC (then sends nothing). No third-party scripts.
5. **Server-side events** from existing flows (best-effort, never throw, never block the response): lead created, signup, login, payment success/failed (from the payment webhook, with value_uzs), lesson start/complete, homework submit, diagnostic complete. Use one helper `trackServerEvent(event)` in `src/features/analytics/server/track.ts`. Other waves (chat) will call it too, so keep its signature stable and documented.
6. **Query service** `src/features/analytics/server/analytics.service.ts` (split into several files ≤ 250 lines). Pure functions over an injected repository. Every function takes `{ from, to, granularity? }` and returns typed data with a `summary` string field (Uzbek, one sentence) so MCP and AI agents can narrate it.
   - overview KPIs with the previous-period delta: visitors, sessions, page views, leads, signups, paying customers, revenue UZS, conversion rates;
   - timeseries per day/week for any KPI;
   - acquisition: sources (referrer host / utm_source / direct), campaigns, landing pages with conversion;
   - behaviour: top pages, **entry pages, exit pages with exit rate**, average engaged time, scroll depth;
   - funnel: visit → diagnostika → lead → signup → checkout → paid (counts plus step conversion);
   - students: active students, new enrolments, per-course lesson completion %, lesson drop-off (the lesson where students stop), homework submission rate, cohort attendance (use the real attendance signal that exists; if none exists, define "attended" = lesson_start in the cohort week and document it);
   - sales: revenue by day/course, average order, refunds, top referrers.
   - Also devices, countries and realtime (active visitors in the last 5 min).
   - Use SQL aggregates (date_trunc, FILTER), never load raw rows into JS. Add the indexes the queries need. Cache heavy queries 60 s.
7. **Admin dashboard** `/admin/analytics` (extend what exists, admin-only):
   - date range (Bugun / 7 kun / 30 kun / 90 kun / custom) and compare-to-previous toggle;
   - KPI tiles with deltas, traffic + revenue chart, funnel, sources table, entry/exit pages, students & lessons block (completion per course, drop-off lesson), sales block, realtime counter.
   - Beautiful, calm, readable, light and dark, 390 px friendly.
   - Charts: small dependency-free SVG components (line/area, bar, funnel, sparkline) in `src/features/analytics/ui/charts/`, accessible (title/desc, table fallback), tooltips, theme tokens. These same chart components will be reused by W8B for MCP visual output, so keep them pure (props in → SVG out, server-renderable).
   - Every empty state is designed and honest: "Ma'lumot yig'ilmoqda — birinchi tashriflar kelishi bilan shu yerda ko'rinadi."
8. **Retention**: the existing cron deletes raw events older than 400 days. Keep a daily rollup table only if queries need it (justify in the report).
9. **Privacy note** for `/maxfiylik`: add a short honest paragraph about first-party analytics (what is collected, no third parties, DNT respected).
10. **Admin API** `GET /api/v1/admin/analytics/<report>?from&to` (admin-only) returns the service outputs in the v1 envelope. Used by the dashboard, MCP and mobile.

TESTS: ingestion (validation, dedupe, bot filter, DB-down → 202, rate limit), tracker (DNT, beacon), every service function against a mocked repository, admin route auth (401/403), and the dashboard renders its empty state.
GATE: see PHASE2-RULES "Definition of done". Lighthouse mobile (`--throttling-method=devtools`, through the lock) on `/`: CLS 0, LCP ≤ 2.5 s, and no tracker request before LCP.
