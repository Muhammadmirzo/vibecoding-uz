# Naqsh MCP Server

Stdio MCP server exposing platform operations to external AI agents.
`index.ts` is a thin bootstrap (auth check → stdio); each tool lives in
`tools/*.ts` exporting `TOOL_DEF` + `handle(rawArgs, deps)`. All tool input
is validated with Zod schemas in `src/lib/validations/mcp.ts`.

## Auth

- `MCP_AUTH_TOKEN` env var is **required**. The server refuses to start
  without it (fail-closed, non-zero exit, message on stderr).
- Every tool call accepts an optional `authToken` argument, compared with
  `crypto.timingSafeEqual`. Missing/wrong token → structured
  `{ ok:false, error:"unauthorized" }` (isError true).
- Tokens are never logged.

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

## Run

```sh
MCP_AUTH_TOKEN=... npm run mcp:start
```
