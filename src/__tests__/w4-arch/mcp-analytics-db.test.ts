/**
 * Real-Postgres integration test for the MCP analytics tools and the write
 * tools' audit trail. Mock-only DB tests have shipped SQL that broke on the
 * real DB, so every new handler runs here against DATABASE_URL (all
 * migrations applied). Skips when DATABASE_URL is unset or unreachable.
 * All rows are inserted with a unique tag in a fixed 2019 window and
 * deleted in afterAll.
 */
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/db";
import { analyticsEvents, auditLogs, homeworkSubmissions, payments } from "@/db/schema";
import { MCP_AUTH_ENV_VAR } from "../../../mcp-server/auth";
import { dispatchTool } from "../../../mcp-server/server";
import type { McpToolResult } from "../../../mcp-server/types";

const TOKEN = "test-token-db-integration";
const TAG = randomUUID().slice(0, 8);
const SOURCE = `mcp-it-${TAG}`;
const WINDOW = { from: "2019-02-01", to: "2019-02-10" };
const S1 = randomUUID();
const S2 = randomUUID();
const eventIds: string[] = [];
const created = { paymentId: "", submissionId: "", broadcastIds: [] as string[] };
const fixture = { userId: "", enrollmentId: "", courseId: "", assignmentId: "", mentorId: "" };
let reachable = false;

type Row = Record<string, unknown>;
async function one(query: ReturnType<typeof sql>): Promise<Row> {
  const rows = await db.execute<Row>(query);
  const row = rows[0];
  if (row === undefined) throw new Error("fixture row missing");
  return row;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function payload(result: McpToolResult): Record<string, unknown> {
  const parsed: unknown = JSON.parse(result.content[0]?.text ?? "{}");
  if (!isRecord(parsed)) throw new Error("tool payload is not an object");
  return parsed;
}
function get(value: unknown, ...path: (string | number)[]): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (Array.isArray(acc) && typeof key === "number") return acc[key];
    if (isRecord(acc) && typeof key === "string") return acc[key];
    throw new Error(`path ${path.join(".")} not found`);
  }, value);
}
async function call(name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const body = payload(await dispatchTool(name, { ...args, authToken: TOKEN }));
  if (body.ok !== true) throw new Error(`${name} failed: ${JSON.stringify(body)}`);
  return body;
}

function event(sessionId: string, type: string, path: string, extra: Partial<typeof analyticsEvents.$inferInsert> = {}) {
  const eventId = randomUUID();
  eventIds.push(eventId);
  return {
    eventId, sessionId, type, path, occurredAt: new Date("2019-02-05T10:00:00Z"),
    visitorHash: `${sessionId}-v`, device: "desktop", browserFamily: "chrome", ...extra,
  };
}

beforeAll(async () => {
  process.env[MCP_AUTH_ENV_VAR] = TOKEN;
  if (!process.env.DATABASE_URL) return;
  try {
    await db.execute(sql`SELECT 1`);
    reachable = true;
  } catch {
    return;
  }
  const enrollment = await one(sql`SELECT e.id, e.user_id, c.course_id FROM enrollments e JOIN cohorts c ON c.id = e.cohort_id LIMIT 1`);
  const assignment = await one(sql`SELECT id FROM homework_assignments LIMIT 1`);
  const mentor = await one(sql`SELECT id FROM users ORDER BY (role = 'mentor') DESC LIMIT 1`);
  Object.assign(fixture, {
    enrollmentId: String(enrollment.id), userId: String(enrollment.user_id), courseId: String(enrollment.course_id),
    assignmentId: String(assignment.id), mentorId: String(mentor.id),
  });
  const s1 = { utmSource: SOURCE, utmCampaign: `camp-${TAG}`, userId: fixture.userId };
  await db.insert(analyticsEvents).values([
    event(S1, "page_view", "/kurslar/ai", s1),
    event(S1, "diagnostic_start", "/kurslar/ai", s1),
    event(S1, "lead_created", "/kurslar/ai", s1),
    event(S1, "signup", "/kurslar/ai", s1),
    event(S1, "checkout_start", "/kurslar/ai", s1),
    event(S1, "payment_success", "/kurslar/ai", { ...s1, valueUzs: 2_490_000 }),
    event(S1, "lesson_start", "/learn", s1),
    event(S2, "page_view", "/", { referrerHost: `google-${TAG}.com` }),
    event(S2, "page_leave", "/", { referrerHost: `google-${TAG}.com`, props: { engagedMs: 30_000, scrollDepth: 80 } }),
  ]);
  const [payment] = await db.insert(payments).values({
    userId: fixture.userId, enrollmentId: fixture.enrollmentId, provider: "manual", amountSum: "2490000.00",
    amountTiyin: 249_000_000, status: "paid", paidAt: new Date("2019-02-05T12:00:00"), providerTxnId: `mcp-it-${TAG}`,
  }).returning({ id: payments.id });
  created.paymentId = payment?.id ?? "";
}, 30_000);

afterAll(async () => {
  if (!reachable) return;
  const ids = [created.submissionId, ...created.broadcastIds].filter(Boolean);
  for (const id of ids) await db.execute(sql`DELETE FROM audit_logs WHERE entity_id = ${id}`);
  for (const id of created.broadcastIds) await db.execute(sql`DELETE FROM broadcast_notifications WHERE id = ${id}`);
  if (created.submissionId) await db.execute(sql`DELETE FROM homework_submissions WHERE id = ${created.submissionId}`);
  if (created.paymentId) await db.execute(sql`DELETE FROM payments WHERE id = ${created.paymentId}`);
  for (const id of eventIds) await db.execute(sql`DELETE FROM analytics_events WHERE event_id = ${id}`);
}, 30_000);

describe("MCP analytics tools against real Postgres", () => {
  it("get_analytics_overview", async (ctx) => {
    if (!reachable) return ctx.skip();
    const body = await call("get_analytics_overview", WINDOW);
    expect(get(body, "range", "from")).toBe("2019-02-01T00:00:00.000Z");
    expect(get(body, "metrics", "visitors", "current")).toBe(2);
    expect(get(body, "metrics", "leads", "current")).toBe(1);
    expect(get(body, "metrics", "payingCustomers", "current")).toBe(1);
    expect(get(body, "revenue", "current")).toEqual({ tiyin: 249_000_000, formatted: "2 490 000 so'm" });
  });

  it("get_traffic_sources", async (ctx) => {
    if (!reachable) return ctx.skip();
    const body = await call("get_traffic_sources", { ...WINDOW, limit: 50 });
    const sources = get(body, "sources");
    expect(sources).toContainEqual({ source: SOURCE, visitors: 1, leads: 1, conversionPct: 100 });
    expect(sources).toContainEqual({ source: `google-${TAG}.com`, visitors: 1, leads: 0, conversionPct: 0 });
    expect(get(body, "campaigns")).toContainEqual({
      campaign: `camp-${TAG}`, visitors: 1, leads: 1, conversionPct: 100, revenue: { tiyin: 249_000_000, formatted: "2 490 000 so'm" },
    });
  });

  it("get_conversion_funnel", async (ctx) => {
    if (!reachable) return ctx.skip();
    const body = await call("get_conversion_funnel", WINDOW);
    const steps = get(body, "steps");
    if (!Array.isArray(steps)) throw new Error("steps is not an array");
    const counts = steps.map((step: unknown) => get(step, "sessions"));
    expect(counts).toEqual([2, 1, 1, 1, 1, 1]);
    expect(get(body, "biggestDropOff", "intoStep")).toBe("diagnostic");
  });

  it("get_landing_page_performance", async (ctx) => {
    if (!reachable) return ctx.skip();
    const body = await call("get_landing_page_performance", WINDOW);
    expect(get(body, "pages")).toContainEqual({ path: "/kurslar/ai", visitors: 1, leads: 1, conversionPct: 100 });
    expect(get(body, "entryPages")).toContainEqual({ path: "/", sessionsStarted: 1 });
    expect(get(body, "engagement", "averageEngagedSeconds")).toBe(15);
  });

  it("get_sales_report", async (ctx) => {
    if (!reachable) return ctx.skip();
    const body = await call("get_sales_report", WINDOW);
    expect(get(body, "totals", "revenue")).toEqual({ tiyin: 249_000_000, formatted: "2 490 000 so'm" });
    expect(get(body, "totals", "orders")).toBe(1);
    expect(get(body, "revenueByCourse", 0, "courseId")).toBe(fixture.courseId);
    expect(get(body, "bestDays", 0, "date")).toBe("2019-02-05");
  });

  it("get_student_progress_report", async (ctx) => {
    if (!reachable) return ctx.skip();
    const body = await call("get_student_progress_report", WINDOW);
    expect(get(body, "activeStudents")).toBe(1);
    expect(typeof get(body, "cohortAttendanceRatePct")).toBe("number");
    expect(Array.isArray(get(body, "courses"))).toBe(true);
  });
});

describe("MCP write tools write an audit_logs row (real Postgres)", () => {
  async function auditRows(entityId: string) {
    return db.execute<Row>(sql`SELECT action, user_id, user_email, entity_type, details FROM audit_logs WHERE entity_id = ${entityId} ORDER BY created_at`);
  }

  it("grade_homework: review + submission status + audit in one transaction", async (ctx) => {
    if (!reachable) return ctx.skip();
    const [submission] = await db.insert(homeworkSubmissions)
      .values({ assignmentId: fixture.assignmentId, userId: fixture.userId, payload: { tag: TAG } })
      .returning({ id: homeworkSubmissions.id });
    created.submissionId = submission?.id ?? "";
    const args = { submissionId: created.submissionId, score: 85, feedback: "Yaxshi", mentorId: fixture.mentorId };
    await call("grade_homework", args);
    await call("grade_homework", { ...args, score: 40, status: "needs_revision" });
    const review = await one(sql`SELECT score::text AS score FROM homework_reviews WHERE submission_id = ${created.submissionId}`);
    expect(review.score).toBe("40.00");
    const status = await one(sql`SELECT status::text AS status FROM homework_submissions WHERE id = ${created.submissionId}`);
    expect(status.status).toBe("reviewing");
    const audits = await auditRows(created.submissionId);
    expect(audits).toHaveLength(2);
    expect(audits[0]).toMatchObject({ action: "homework.review", user_id: null, user_email: "mcp", entity_type: "homework_submission" });
    expect(get(audits[1], "details")).toMatchObject({ actor: "mcp", score: 40, status: "needs_revision", reviewUpdated: true });
  });

  it("grade_homework: unknown submission writes nothing", async (ctx) => {
    if (!reachable) return ctx.skip();
    const missing = randomUUID();
    const body = payload(await dispatchTool("grade_homework", {
      submissionId: missing, score: 70, feedback: "x", mentorId: fixture.mentorId, authToken: TOKEN,
    }));
    expect(body.error).toBe("submission_not_found");
    expect(await auditRows(missing)).toHaveLength(0);
  });

  it("broadcast_notification: queued row + audit row", async (ctx) => {
    if (!reachable) return ctx.skip();
    const body = await call("broadcast_notification", {
      title: `mcp-it-${TAG}`, messageBody: "Integratsiya testi xabari", targetAudience: "leads_new",
    });
    const id = String(get(body, "broadcast", "id"));
    created.broadcastIds.push(id);
    const audits = await auditRows(id);
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({ action: "notification.broadcast", user_email: "mcp", entity_type: "broadcast_notification" });
    expect(get(audits[0], "details")).toMatchObject({
      actor: "mcp", status: "queued", recipientsCount: get(body, "broadcast", "recipientsCount"),
    });
    const logged = await db.select({ n: sql<number>`count(*)::int` }).from(auditLogs).where(sql`entity_id = ${id}`);
    expect(logged[0]?.n).toBe(1);
  });
});
