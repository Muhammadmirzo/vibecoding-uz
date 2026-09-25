# Naqsh MCP Server

MCP server exposing platform operations to external AI agents, over two
transports that share one tool registry — nothing is duplicated:

- **stdio** (`index.ts`) — local CLI use (`npm run mcp:start`).
- **Streamable HTTP** (`src/app/api/mcp/route.ts`) — the remote endpoint,
  for Claude.ai custom connectors, Claude Desktop, and `claude mcp add`.

Both call `createMcpServer()` in `server.ts`, which wires the same
`toolRegistry` to a fresh MCP `Server` instance. Each tool lives in
`tools/*.ts` exporting `TOOL_DEF` + `handle(rawArgs, deps)`. All tool input
is validated with Zod schemas in `src/lib/validations/mcp.ts`.

## Auth

- `MCP_AUTH_TOKEN` env var is **required** on both transports, fail-closed:
  - stdio refuses to start without it (non-zero exit, message on stderr).
  - the HTTP route returns `503 { error: "mcp_not_configured" }` for every
    request when it's unset — never silently open.
- **stdio**: every tool call accepts an optional `authToken` argument,
  compared with `crypto.timingSafeEqual`. Missing/wrong token → structured
  `{ ok:false, error:"unauthorized" }` (isError true). This keeps working
  unchanged.
- **HTTP**: send `Authorization: Bearer <MCP_AUTH_TOKEN>` once, on the
  transport. It's checked with the same `crypto.timingSafeEqual` compare
  (`mcp-server/auth.ts`), and a verified request has that token injected
  into every tool call for you — tools' own `authToken` gate still runs, you
  just don't repeat the token per call. Missing/wrong header → `401` with a
  `WWW-Authenticate: Bearer` header.
- The HTTP route is also rate-limited per client IP (`checkRateLimit`, 60
  req/min) — an exhausted caller gets `429` with `Retry-After`.
- Tokens are never logged, on either transport.

## Tools

All tools take `authToken` (stdio) or get it injected from the HTTP
`Authorization: Bearer` header. Analytics tools also take optional `from` /
`to` (ISO `YYYY-MM-DD` or ISO datetime; a date-only `to` covers that whole
UTC day; default = last 30 days; `from <= to`; max 366 days) and, where
they return lists, `limit` (1-50, default 10). Every analytics response
echoes the `range` it used. Money is returned as `{ tiyin, formatted }` —
integer tiyin plus a formatted so'm string.

| Tool | Mode | What it does |
| --- | --- | --- |
| `get_analytics_overview` | read-only | Visitors, sessions, page views, leads, signups, paying customers, revenue and conversion rates vs the previous period of equal length (`getOverview`) |
| `get_traffic_sources` | read-only | Sources (utm_source → referrer → direct) and UTM campaigns with visitors, leads, conversion, campaign revenue (`getAcquisition`) |
| `get_conversion_funnel` | read-only | Session funnel visit → diagnostic → lead → signup → checkout → paid, with the biggest drop-off (`getFunnel`) |
| `get_landing_page_performance` | read-only | Per-page visitors/leads/conversion, entry pages, exit pages + exit rate, average engaged time and scroll (`getAcquisition` + `getBehaviour`) |
| `get_sales_report` | read-only | Paid revenue, orders, average order, refunds, revenue by course, best days, top referrers (`getSales`) |
| `get_student_progress_report` | read-only | Active students, new enrollments, homework submission rate, cohort attendance, per-course completion and drop-off lesson (`getStudents`) |
| `get_platform_kpis` | read-only | Drizzle counts on leads/enrollments/homework/payments |
| `query_leads_pipeline` | read-only | `leads` table by status |
| `get_cohort_status` | read-only | `cohorts` + live `enrollments` counts |
| `get_student_activity` | read-only | users/enrollments/lesson_progress/homework; status derived (active enrollment + 7d activity → active, else at_risk; finished → completed; paused/expelled → inactive) |
| `grade_homework` | **write** | updates `homework_submissions`, upserts `homework_reviews`, inserts an `audit_logs` row — all in one transaction; requires `mentorId` |
| `broadcast_notification` | **write** | inserts a `broadcast_notifications` row (`queued`, real recipient count) + an `audit_logs` row in one transaction; does NOT send (no sender worker exists) |
| `generate_discount_promocode` | unsupported | honest `{ ok:false, error:"promocodes_not_supported" }` — no promocode table |

The six analytics tools reuse the same services as `/admin/analytics`
(`src/features/analytics/server/*`) — no separate SQL.

### Audit trail

Both write tools insert an `audit_logs` row inside the same transaction
as the write (same convention as the admin services): if the audit insert
fails, the write is rolled back and the tool returns an error. The row has
`user_id = null`, `user_email = "mcp"` (shown as the actor in the admin
audit table), `details.actor = "mcp"`, and actions `homework.review` /
`notification.broadcast` — the same action names the admin panel uses.

### Example questions (ask Claude in Uzbek)

- "Bu hafta qaysi kanal eng ko'p lead olib keldi?" → `get_traffic_sources`
- "O'tgan oyga nisbatan tashrifchilar va tushum qanchaga o'zgardi?" → `get_analytics_overview`
- "Voronkada eng ko'p odam qaysi bosqichda tushib qolyapti?" → `get_conversion_funnel`
- "Qaysi sahifa eng yaxshi konversiya qilyapti, qaysi sahifadan ko'p chiqib ketishyapti?" → `get_landing_page_performance`
- "Sentyabr oyida qancha sotdik va qaysi kurs eng ko'p pul olib keldi?" → `get_sales_report`
- "Talabalar kurslarni qanchalik tugatyapti, qaysi darsda to'xtab qolishyapti?" → `get_student_progress_report`
- "Qaysi UTM kampaniya eng ko'p to'lov olib keldi?" → `get_traffic_sources`
- "Yangi leadlarni ko'rsat" → `query_leads_pipeline`

## Run (stdio, local)

```sh
MCP_AUTH_TOKEN=... npm run mcp:start
```

## Connect (remote, over HTTPS)

The live site serves the same tools at `https://master-2-jade.vercel.app/api/mcp`.
`MCP_AUTH_TOKEN` must be set in the deployment's environment (Vercel) —
without it the endpoint answers `503` for every request.

### Claude Code

```sh
claude mcp add --transport http naqsh https://master-2-jade.vercel.app/api/mcp \
  --header "Authorization: Bearer $MCP_AUTH_TOKEN"
```

Or drop a `.mcp.json` (see the one at the repo root) into a project so the
connector is configured for anyone who opens it there — it expands
`${MCP_AUTH_TOKEN}` from the environment, so no secret is ever committed.

### Claude Desktop

`claude_desktop_config.json` (Settings → Developer → Edit Config) launches
local processes, so bridge to the remote endpoint with `mcp-remote`, which
sends the Bearer header for you:

```json
{
  "mcpServers": {
    "naqsh": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote", "https://master-2-jade.vercel.app/api/mcp",
        "--header", "Authorization:${NAQSH_AUTH}"
      ],
      "env": { "NAQSH_AUTH": "Bearer <your MCP_AUTH_TOKEN>" }
    }
  }
}
```

Restart Claude Desktop; the tools appear in the tools menu of the chat box. (The
`env` indirection avoids a space inside `args`, which some Desktop builds
split incorrectly.)

### claude.ai custom connector

Settings → Connectors → **Add custom connector** → URL
`https://master-2-jade.vercel.app/api/mcp`. At the time of writing the claude.ai connector dialog
only supports OAuth or no auth — it has no field for a static
`Authorization` header — so this endpoint (Bearer-only, fail-closed) will
answer `401` there until an OAuth flow is added. Until then use Claude
Code or Claude Desktop (above) — Desktop connectors added through the
same Settings → Connectors dialog have the same limitation.

### curl smoke test

```sh
# initialize
curl -s https://master-2-jade.vercel.app/api/mcp \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'

# tools/list
curl -s https://master-2-jade.vercel.app/api/mcp \
  -H "Authorization: Bearer $MCP_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

Each request is stateless — no session ID is issued or required, so
`initialize` and `tools/list`/`tools/call` can be sent independently.

`.mcp.json` at the repo root is the only MCP client config. (The old
`mcp.json` / `mcp-config.json` pointed at a `/api/mcp/sse` transport that
was never built and were removed.)
