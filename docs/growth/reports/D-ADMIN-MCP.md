# D-ADMIN-MCP — Admin panel × MCP capability map

## 1. Capability matrix

| Capability | Admin panel | MCP tool |
| --- | --- | --- |
| Leads pipeline | yes — `/admin/leads` (Kanban, `LeadsKanban.tsx`, `leads.service.ts`) | yes — `query_leads_pipeline` (read) |
| Payments / revenue | partial — no dedicated admin payments tab; revenue only inside `/admin/analytics` (Sales report) | partial — `get_platform_kpis` returns `paidPayments`/`paidRevenueTiyin` only; no payments list/filter tool |
| Enrollments / cohorts | yes — `/admin/cohorts` (`CohortManager.tsx`, `cohorts.service.ts`) | yes — `get_cohort_status` (read) |
| Students / progress | yes — `/admin/students` (`StudentActivityTracker.tsx`) | yes — `get_student_activity` (read) |
| Homework | yes — `/admin/homework` (`HomeworkQueue.tsx`) | yes — `grade_homework` (write only; no read/list tool) |
| Analytics: funnel | yes — `/admin/analytics` (`getFunnel`, `traffic.service.ts`) | no |
| Analytics: traffic sources / UTM | yes — `/admin/analytics` (`getAcquisition`: sources, campaigns, landing pages) | no |
| Analytics: overview/timeseries/sales/students | yes — `/admin/analytics` (`overview.service.ts`, `timeseries.service.ts`, `business.service.ts`) | no |
| Chat | yes — `/admin/chat` | no |
| Portfolio | yes — `/admin/portfolio` (`PortfolioManager.tsx`) | no |
| Blog | yes — `/admin/blog` (`BlogManager.tsx`) | no |
| Site settings / prices | yes — `/admin/settings` (`SettingsManager.tsx`) | no |
| Promo codes | no — no admin UI, and **no DB table** for promocodes | no — `generate_discount_promocode` honestly returns `promocodes_not_supported` |
| Broadcasts | yes — `/admin/notifications` (`NotificationManager.tsx`) | yes — `broadcast_notification` (write; queues only, no sender worker) |
| Referrals | no admin UI (student-facing only: `/kabinet/referral`, `/api/referral/*`) | no |

## 2. Existing MCP tools — mode / safety / SQL correctness

All 7 tools live in `mcp-server/tools/*.ts`, registered in `mcp-server/index.ts`. Every tool: (a) gates on `verifyAuthToken` (`mcp-server/auth.ts`, constant-time compare, fail-closed on missing `MCP_AUTH_TOKEN`), (b) validates input with Zod (`src/lib/validations/mcp.ts`), (c) returns structured `{ok:false,error}` rather than throwing.

| Tool | Mode | Admin-safe | SQL vs `src/db/schema/*` |
| --- | --- | --- | --- |
| `get_platform_kpis` | read | auth ✔ Zod ✔ audit log: none (read, low risk) | verified — `leads.createdAt`, `enrollments.status`, `homeworkSubmissions.status`, `payments.status/paidAt/amountTiyin`, `cohorts` all match schema columns exactly |
| `query_leads_pipeline` | read | auth ✔ Zod ✔ | verified — `leads.{id,name,phone,telegram,source,status,createdAt}` all real columns |
| `get_cohort_status` | read | auth ✔ Zod ✔ UUID check | verified — `cohorts.{startsAt,seats,priceSum,earlyPriceSum,earlyDeadline,status}` and `courses.title` join, `enrollments` groupBy — all real |
| `get_student_activity` | read | auth ✔ Zod ✔ UUID check | verified — `users.{fullName,phone,email,lastLoginAt}`, `enrollments`⋈`cohorts`, `lessonProgress.{lessonId,completedAt,lastSeenAt}`, `homeworkSubmissions.status` — all real; status is derived client-side (no quiz-scores table, documented in code comment) |
| `grade_homework` | **write** | auth ✔ Zod ✔ requires `mentorId` (matches `homework_reviews.mentor_id NOT NULL`) — **no row written to `audit_logs`** despite that table existing (`src/db/schema/operations.ts`) | verified — updates `homework_submissions.status`, upserts `homework_reviews.{mentorId,criteriaResults,score,feedbackMd,reviewedAt}` |
| `broadcast_notification` | **write** | auth ✔ Zod ✔ — **no audit log entry**; honestly reports `deliveryStatus:"queued_not_sent"` (no sender worker exists) | verified — inserts into `broadcast_notifications` with real recipient counts computed per audience segment |
| `generate_discount_promocode` | n/a (stub) | auth ✔ Zod ✔ | correctly refuses — no promocode table in schema, so it returns `promocodes_not_supported` instead of faking success |

This set is notably **not** the class of bug W8A hit (raw `Date` params / camelCase-vs-snake_case column mismatches) — every column referenced above was checked against `src/db/schema/{crm,commercial,homework,users,courses,operations}.ts` and matches. Gaps here are about **audit logging** (writes are silent, no `audit_logs` row, no admin-visible trail of what an AI agent changed) and **coverage** (no analytics, blog, portfolio, settings, payments-list, or referrals tools at all).

## 3. Ranked gaps — read-only MCP tools with highest owner value

Owner asks like "how did marketing do this week / which pages convert / which leads are hot" need read-only wrappers around the **already-built** `src/features/analytics` service layer, which the MCP server does not touch at all (confirmed: no import of `@/features/analytics` anywhere in `mcp-server/`).

1. **`get_analytics_overview`** — highest value. Inputs (Zod): `{ from?: string(date), to?: string(date), authToken }` (default last 30d). Reuses `getOverview(repository, range)` in `src/features/analytics/server/overview.service.ts` (visitors, sessions, leads, signups, paying customers, revenue, deltas vs prior period). Answers "how did we do this week."
2. **`get_traffic_sources`** — Inputs: `{ from?, to?, authToken }`. Reuses `getAcquisition(repository, range)` in `src/features/analytics/server/traffic.service.ts` → `repository.sources/campaigns/landingPages` (UTM-level breakdown already exists in `analytics.repository.ts`). Directly answers "which channels/campaigns work."
3. **`get_conversion_funnel`** — Inputs: `{ from?, to?, authToken }`. Reuses `getFunnel` (same file) / `repository.funnel(range)`. Answers "which pages convert."
4. **`get_landing_page_performance`** — Inputs: `{ from?, to?, limit?, authToken }`. Reuses `repository.landingPages` and `behaviour(range)` (top/entry/exit pages) in `analytics.repository.ts` — "which pages convert" at page granularity.
5. **`get_sales_report`** — Inputs: `{ from?, to?, authToken }`. Reuses `getSales` in `business.service.ts` (revenue by day/course, refunds, top referrers). Fills the payments/revenue gap in section 1.
6. **`query_hot_leads`** — Inputs: `{ minScore?/status?, limit?, authToken }`. No scoring field exists on `leads` today (checked `src/db/schema/crm.ts` — no `score`/`temperature` column), so "hot leads" would have to be a heuristic (e.g. `status in (consultation, pending)` + recent `nextContactAt`) built on `leads.repository.ts` / `leads.service.ts`, not a 1:1 reuse. Flag as a design decision for the owner rather than a pure exposure task.
7. **`get_student_progress_report`** — Inputs: `{ cohortId?, authToken }`. Reuses `getStudents` in `business.service.ts` (active students, new enrollments, homework submission rate, cohort attendance) — complements the existing per-student `get_student_activity` with an aggregate view.

**Overlap with W8B**: per `docs/waves/STATE.md` row W8B ("World-class MCP: remote HTTP + OAuth + visual charts", branch `wave/w8b-mcp`, NOT pushed to origin, agent-done/unreviewed, migration not applied), W8B's scope is the *transport/auth/visualization* layer (OAuth flow, chart rendering) — not the *stdio* tool registry read from here. Tools 1–5 and 7 above are new read-only stdio/HTTP tools wrapping the existing analytics service; they do not duplicate W8B's OAuth or chart-rendering work, but W8B may already add analytics-shaped tools on its own — **do not build both without reconciling**; STATE.md explicitly says the next step is "review W8B," not start new MCP work in parallel.

## 4. How the owner connects today (from `mcp-server/README.md`)

- Both transports share one registry: **stdio** (`mcp-server/index.ts`, `npm run mcp:start`) for local CLI use, and **Streamable HTTP** (`src/app/api/mcp/route.ts`) at `https://master-2-jade.vercel.app/api/mcp` for Claude.ai/Desktop/`claude mcp add`.
- **Claude Code**: `claude mcp add --transport http naqsh https://master-2-jade.vercel.app/api/mcp --header "Authorization: Bearer $MCP_AUTH_TOKEN"`, or a checked-in `.mcp.json` that expands `${MCP_AUTH_TOKEN}` from env (no secret committed).
- **Claude Desktop**: Settings → Connectors → Add custom connector (URL + header), or a `claude_desktop_config.json` entry with `type: "http"`, `url`, and `headers.Authorization`.
- **claude.ai custom connector**: same URL + Bearer header via Settings → Connectors.
- Requires `MCP_AUTH_TOKEN` set in Vercel; without it the HTTP route returns `503 {error:"mcp_not_configured"}` for every request (fail-closed, not silently open).

**Bug/staleness noted by the README itself**: a `mcp.json` / `mcp-config.json` at the repo root predate this HTTP endpoint and still point at a `/api/mcp/sse` SSE transport **that was never built** — if the owner or Claude Desktop picks up those files instead of `.mcp.json`, the connection will fail. The README flags `.mcp.json` + itself as the only source of truth; the stale `mcp.json`/`mcp-config.json` should be deleted or fixed so no one configures against the dead SSE path.

---
**Files referenced**: `mcp-server/{README.md,index.ts,server.ts,auth.ts,types.ts,tools/*.ts}`, `src/lib/validations/mcp.ts`, `src/db/schema/{crm,commercial,homework,users,courses,operations}.ts`, `src/features/analytics/server/*.ts`, `src/features/crm/server/leads.repository.ts`, `src/app/admin/**/page.tsx`, `docs/waves/STATE.md` (rows W8A/W8B).
