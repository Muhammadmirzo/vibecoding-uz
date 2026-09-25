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

| Tool | Mode | Backing |
| --- | --- | --- |
| `get_platform_kpis` | read-only | Drizzle counts on leads/enrollments/homework/payments |
| `query_leads_pipeline` | read-only | `leads` table |
| `get_cohort_status` | read-only | `cohorts` + live `enrollments` counts |
| `get_student_activity` | read-only | users/enrollments/lesson_progress/homework; status derived (no quiz-scores table: active enrollment + 7d activity → active, else at_risk; finished → completed; paused/expelled → inactive) |
| `grade_homework` | **write** (auth required) | updates `homework_submissions`, upserts `homework_reviews`; requires `mentorId` (reviews.mentor_id is NOT NULL) |
| `broadcast_notification` | **write** (auth required) | inserts `broadcast_notifications` row with status `queued` + real recipient count; does NOT send (no sender worker exists) |
| `generate_discount_promocode` | unsupported | honest `{ ok:false, error:"promocodes_not_supported" }` — no promocode table in schema |

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

Claude Desktop connects to remote HTTP servers via **Settings → Connectors
→ Add custom connector**, entering the URL and header there directly (no
config-file editing needed). If your build of Desktop instead reads
`claude_desktop_config.json`, the equivalent entry is:

```json
{
  "mcpServers": {
    "naqsh": {
      "type": "http",
      "url": "https://master-2-jade.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer <your MCP_AUTH_TOKEN>"
      }
    }
  }
}
```

### claude.ai custom connector

Settings → Connectors → Add custom connector → URL
`https://master-2-jade.vercel.app/api/mcp`, Authorization header
`Bearer <your MCP_AUTH_TOKEN>`.

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

> `mcp.json` / `mcp-config.json` at the repo root predate this endpoint and
> still point at a `/api/mcp/sse` SSE transport that was never built; treat
> `.mcp.json` and this README as the source of truth for the HTTP transport.
