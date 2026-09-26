# I-MCP report — branch wave/mcp, commit 496ab22

## Files changed
New: mcp-server/tools/{analytics-shared,analytics-overview,traffic-sources,conversion-funnel,landing-pages,sales-report,student-progress,db-audit,db-write-broadcast}.ts,
src/__tests__/w4-arch/mcp-tools-analytics.test.ts (unit), src/__tests__/w4-arch/mcp-analytics-db.test.ts (real DB).
Modified: mcp-server/server.ts (registry +6), mcp-server/tools/db-write.ts (grade in tx + audit; broadcast moved to db-write-broadcast.ts, re-exported),
tools/homework.ts + broadcast.ts (descriptions), src/lib/validations/mcp.ts (range/limit schemas, 142 lines),
mcp-server/README.md, mcp-tools.test.ts + mcp-http-route.test.ts (tool list 7 -> 13).
Deleted (git rm): mcp.json, mcp-config.json. All source files <= 250 lines (largest 220, a test).

## Tools (13 total; both stdio and HTTP use the same registry)
New read-only: get_analytics_overview, get_traffic_sources, get_conversion_funnel, get_landing_page_performance,
get_sales_report, get_student_progress_report. They reuse getOverview/getAcquisition/getBehaviour/getFunnel/getSales/getStudents
with drizzleAnalyticsRepository. I wrote no new SQL.
Inputs: from/to as ISO date or datetime. A date-only `to` covers that whole day. Defaults to the last 30 days; from<=to; max 366 days; limit 1-50, default 10.
Output echoes the range used. Money is returned as {tiyin, formatted}. The analytics layer reports whole so'm, and the tools convert that to tiyin.
Write tools: the audit_logs insert now runs in the same withTransactionLock transaction as the write (same lock key as the admin service).
A failed audit rolls the write back and the tool returns an error, which matches the admin convention. Each row gets user_id=null, user_email="mcp", details.actor="mcp", source="mcp_server".
The actions are homework.review / notification.broadcast, the same names the admin panel uses.

## Stale configs
There is no /api/mcp/sse route; only src/app/api/mcp/route.ts exists. The files were referenced only by the README, which I updated. .mcp.json is kept.

## Gate (DATABASE_URL=postgres://postgres@127.0.0.1:5432/naqsh)
- npx tsc --noEmit: exit 0
- npx vitest run: 94 files, 635 tests passed, exit 0
  The first full run had 1 failure in hardening/sms-session-rate.test.ts (429 instead of 200). This test is unrelated to MCP.
  Its OTP limit (3 per 5 min) is stored in the rate_limit_buckets table of the persistent DB, so running the suite twice within 5 minutes trips it.
  After the window reset, the full suite passed. The flake existed before this change.

## Verified against the real DB
- The integration test inserts tagged analytics_events in a 2019 window, plus a paid payment, a homework_submission and a broadcast.
  It checks exact values from all 6 tools, for example revenue 249,000,000 tiyin = "2 490 000 so'm", funnel [2,1,1,1,1,1] and engaged time of 15s.
- grade_homework: tested insert and then update; each writes 1 audit row (2 total), and the review score and status are checked.
  An unknown submission writes no audit row.
- broadcast_notification: 1 audit row whose recipientsCount matches the broadcast row.
- Cleanup confirmed: row counts are back to baseline (analytics_events 0, audit_logs 0, payments 7, submissions 7).
- The test skips when DATABASE_URL is unset and when the DB is unreachable; I checked both cases.
- Stdio path check: running dispatchTool("get_sales_report") under tsx against the seed data returned 7 orders = 17 430 000 so'm.

## Risks / follow-ups
1. Existing bug: homework_reviews.score is numeric(4,2), so score=100 fails with "numeric field overflow" on the real DB.
   Both the admin and MCP schemas allow 100. The fix needs a migration to numeric(5,2), which is out of scope, so I did not make it.
2. The analytics repository casts sum(amount_sum)::int. This drops fractional so'm and overflows past about 2.1 billion so'm per bucket.
   The tools inherit this.
3. Not tested: an audit insert that actually fails, then rolls back. It would need a trigger on the shared DB. Rollback relies on the single-transaction design.
4. claude.ai custom connectors (and Desktop connectors added through the UI) only support OAuth or no auth, so the Bearer-only endpoint gets a 401 there.
   The README now says so and documents Claude Code, plus Claude Desktop through mcp-remote. Adding OAuth would be a follow-up.
5. The analytics "pages" list groups all events by path; it is not true landing pages. entryPages covers true landing pages. Both are labelled in the output.
6. The homework submission rate uses the service's fixed "x8 assignments" assumption, which is stated in the output definitions.
