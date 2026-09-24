You are a senior engineer who builds production MCP servers to the current Model Context Protocol specification. Work autonomously until fully done.

FIRST read `docs/waves/PHASE2-RULES.md` (mandatory rules) and `docs/waves/API-CONTRACT.md`, then:
- `mcp-server/**` (the existing stdio server: `auth.ts`, `server.ts`, `tools/*`);
- `src/features/analytics/**` (W8A services and SVG chart components) and `src/features/chat/server/**` (W7 services, if merged);
- `src/features/portfolio/server/**`, `src/lib/auth/require-auth.ts`;
- `docs/waves/reports/W8A-ANALYTICS.md`.

Before designing, research the CURRENT MCP spec and SDK (web search allowed): Streamable HTTP transport, the Authorization spec (OAuth 2.1 + PKCE, Protected Resource Metadata RFC 9728, Authorization Server Metadata RFC 8414, Dynamic Client Registration RFC 7591), tool annotations (`readOnlyHint`, `destructiveHint`), `structuredContent` + `outputSchema`, resources, prompts, and the **MCP Apps** extension (interactive `ui://` HTML resources rendered by Claude / ChatGPT hosts). Upgrade `@modelcontextprotocol/sdk` to the current version if needed. Record spec versions in the report.

Wave id: W8B. Branch `wave/w8b-mcp`. Your dev port: **3307**. Report: `docs/waves/reports/W8B-MCP.md`.

OWNER REQUEST: "Make the MCP world-class, like real experts build it. When I connect any AI (Claude, ChatGPT, etc.) it can manage things by command and I can SEE the data visually in any style I want: students, lesson completion, attendance, sales, visitors, where they came from, where they left, and all other key metrics in detail."

BUILD:
1. **Remote MCP endpoint** `/api/mcp` (Next.js route, Streamable HTTP, stateless mode, Node runtime) that works on Vercel serverless. The existing stdio server keeps working. BOTH servers register tools from ONE shared registry (`src/features/mcp/registry/*`), so there is no duplicated tool code.
2. **Auth, admin-only**, done properly:
   - OAuth 2.1 authorization server inside the app: `/.well-known/oauth-protected-resource`, `/.well-known/oauth-authorization-server`, dynamic client registration, `/oauth/authorize` (consent screen reusing the admin session login, Naqsh-branded, shows the client name and requested scopes), and `/oauth/token` (authorization_code + PKCE S256, refresh_token rotation).
   - Tokens are opaque random values; the DB stores only their hashes (new tables in `src/db/schema/mcp.ts`). Access tokens live 1 h, refresh tokens 30 days. Revocation.
   - Scopes: `analytics:read`, `students:read`, `sales:read`, `chat:read`, `chat:write`, `content:write`.
   - A 401 response carries the `WWW-Authenticate` header with the resource metadata URL, so Claude.ai / ChatGPT connectors can discover it.
   - Also personal access tokens: admin creates them in `/admin/settings` → "MCP ulanishlar" (name, scopes, expiry, last used, revoke), for CLI clients like Claude Code. The page lists connected OAuth clients with a revoke button. Rate limiting; audit log for every write tool call.
3. **Tools** (typed Zod input + outputSchema + `structuredContent` + a short Uzbek text summary; annotations set; pagination):
   - Analytics (from W8A services): `analytics_overview`, `analytics_timeseries`, `analytics_acquisition`, `analytics_behaviour` (entry/exit pages), `analytics_funnel`, `analytics_realtime`.
   - Students: `students_list`, `student_profile` (progress, homework, payments, no secrets), `course_completion`, `lesson_dropoff`, `cohort_attendance`.
   - Sales: `sales_summary`, `sales_by_course`, `payments_list`, `refunds_list`.
   - Leads: `leads_list`, `lead_update_status` (write).
   - Chat (if W7 merged; otherwise guard behind feature detection and document): `chat_list_open`, `chat_thread`, `chat_reply` (write, sender = "ai" or "admin" per token), `chat_set_mode`.
   - Content: `portfolio_list`, `portfolio_update` (write), `site_settings_get`.
   - Destructive tools do not exist (no deletes via MCP).
4. **Visual output — the owner's key wish**:
   - (a) **MCP Apps**: `ui://naqsh/dashboard` and per-chart `ui://naqsh/chart/*` HTML resources referenced from tool `_meta` so hosts that support MCP Apps render interactive charts (line/area, bar, funnel, table, KPI cards; theme-aware, Naqsh style), reusing the W8A SVG chart components rendered server-side to static HTML/SVG with minimal inline JS.
   - (b) For hosts without MCP Apps: every analytics tool also returns a compact Markdown table and a `chartSpec` (Vega-Lite JSON) in `structuredContent`, so any AI can redraw it "in any style". Also provide a PNG/SVG image content block for the main charts (server-side SVG; PNG only if a light dependency allows it).
   - (c) **Prompts**: `haftalik_hisobot` (weekly report), `sotuv_tahlili`, `talabalar_holati`, `marketing_manbalari` — they guide the AI to call the right tools and present a visual summary.
5. **Resources**: `naqsh://courses`, `naqsh://pricing`, `naqsh://metrics-glossary` (a definition for every metric, so AIs explain numbers correctly).
6. **Docs page** `/admin/mcp` explains in simple Uzbek how to connect: Claude.ai (Settings → Connectors → Add custom connector → URL), ChatGPT (developer mode connectors), Claude Code (`claude mcp add --transport http naqsh https://<domain>/api/mcp --header "Authorization: Bearer <PAT>"`), Cursor. Copy buttons, and the live endpoint URL from `siteConfig`.
7. **Testing**: MCP Inspector-style tests with the SDK client over Streamable HTTP in vitest: auth discovery 401 + header, OAuth code + PKCE flow, scope enforcement (403 on a missing scope), each tool's schema validation, and outputSchema conformance. Do a manual run with `npx @modelcontextprotocol/inspector` if feasible and describe it in the report.

SECURITY: admin-only; never expose password hashes, session tokens, raw IPs or other secrets; row caps on every list; PII minimisation (phones masked unless the `students:read` scope has the `pii` flag, off by default).
GATE: see PHASE2-RULES "Definition of done".
