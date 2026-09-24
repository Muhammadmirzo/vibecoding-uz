import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { AnalyticsMetric, AnalyticsRange, CampaignRow, CourseLearningRow, CourseSalesRow, DimensionRow, FunnelStep, LandingRow, PageRow, SalesRow, SourceRow, TimeseriesPoint } from "../domain/report-types";

export interface OverviewTotals { visitors: number; sessions: number; pageViews: number; leads: number; signups: number; payingCustomers: number; revenueUzs: number; checkouts: number }
export interface BehaviourTotals { topPages: PageRow[]; entryPages: PageRow[]; exitPages: PageRow[]; averageEngagedMs: number; averageScrollDepth: number }
export interface StudentTotals { activeStudents: number; newEnrollments: number; courses: CourseLearningRow[]; homeworkSubmissionRate: number; cohortAttendanceRate: number }
export interface SalesTotals { revenueByDay: SalesRow[]; revenueByCourse: CourseSalesRow[]; averageOrderUzs: number; refundsCount: number; refundsUzs: number; topReferrers: SourceRow[] }
export interface AnalyticsRepository {
  overviewTotals(range: AnalyticsRange, previous: AnalyticsRange): Promise<{ current: OverviewTotals; previous: OverviewTotals }>;
  timeseries(range: AnalyticsRange, metric: AnalyticsMetric): Promise<TimeseriesPoint[]>;
  sources(range: AnalyticsRange): Promise<SourceRow[]>;
  campaigns(range: AnalyticsRange): Promise<CampaignRow[]>;
  landingPages(range: AnalyticsRange): Promise<LandingRow[]>;
  behaviour(range: AnalyticsRange): Promise<BehaviourTotals>;
  funnel(range: AnalyticsRange): Promise<FunnelStep[]>;
  students(range: AnalyticsRange): Promise<StudentTotals>;
  sales(range: AnalyticsRange): Promise<SalesTotals>;
  dimensions(range: AnalyticsRange, dimension: "device" | "country"): Promise<DimensionRow[]>;
  realtime(range: AnalyticsRange): Promise<number>;
}
export const EMPTY_OVERVIEW: OverviewTotals = { visitors: 0, sessions: 0, pageViews: 0, leads: 0, signups: 0, payingCustomers: 0, revenueUzs: 0, checkouts: 0 };

type QueryRow = Record<string, unknown>;
function where(from: Date, to: Date) { return sql`occurred_at >= ${from} AND occurred_at < ${to}`; }
function n(value: unknown): number { return typeof value === "number" ? value : Number(value ?? 0); }
function text(value: unknown): string { return typeof value === "string" ? value : "unknown"; }
async function rows(query: ReturnType<typeof sql>): Promise<QueryRow[]> { return db.execute<QueryRow>(query); }
async function totals(range: AnalyticsRange): Promise<OverviewTotals> {
  const result = await rows(sql`SELECT count(DISTINCT visitor_hash)::int AS visitors, count(DISTINCT session_id)::int AS sessions, count(*) FILTER (WHERE type = 'page_view')::int AS "pageViews", count(*) FILTER (WHERE type = 'lead_created')::int AS leads, count(*) FILTER (WHERE type = 'signup')::int AS signups, count(DISTINCT user_id) FILTER (WHERE type = 'payment_success')::int AS "payingCustomers", coalesce(sum(value_uzs) FILTER (WHERE type = 'payment_success'), 0)::int AS "revenueUzs", count(*) FILTER (WHERE type = 'checkout_start')::int AS checkouts FROM analytics_events WHERE ${where(range.from, range.to)}`);
  const row = result[0] ?? {};
  return { visitors: n(row.visitors), sessions: n(row.sessions), pageViews: n(row.pageViews), leads: n(row.leads), signups: n(row.signups), payingCustomers: n(row.payingCustomers), revenueUzs: n(row.revenueUzs), checkouts: n(row.checkouts) };
}
const metricSql: Record<AnalyticsMetric, ReturnType<typeof sql>> = {
  visitors: sql`count(DISTINCT visitor_hash)::int`, sessions: sql`count(DISTINCT session_id)::int`, page_views: sql`count(*) FILTER (WHERE type = 'page_view')::int`, leads: sql`count(*) FILTER (WHERE type = 'lead_created')::int`, signups: sql`count(*) FILTER (WHERE type = 'signup')::int`, paying_customers: sql`count(DISTINCT user_id) FILTER (WHERE type = 'payment_success')::int`, revenue_uzs: sql`coalesce(sum(value_uzs) FILTER (WHERE type = 'payment_success'), 0)::int`,
};
export class DrizzleAnalyticsRepository implements AnalyticsRepository {
  async overviewTotals(range: AnalyticsRange, previous: AnalyticsRange) { const [current, prior] = await Promise.all([totals(range), totals(previous)]); return { current, previous: prior }; }
  async timeseries(range: AnalyticsRange, metric: AnalyticsMetric) { const bucket = range.granularity === "week" ? "week" : "day"; const result = await rows(sql`SELECT date_trunc(${sql.raw(`'${bucket}'`)}, occurred_at) AS timestamp, ${metricSql[metric]} AS value FROM analytics_events WHERE ${where(range.from, range.to)} GROUP BY 1 ORDER BY 1`); return result.map((row) => ({ timestamp: new Date(text(row.timestamp)).toISOString(), value: n(row.value) })); }
  async sources(range: AnalyticsRange) { const result = await rows(sql`SELECT COALESCE(utm_source, referrer_host, 'direct') AS source, count(DISTINCT visitor_hash)::int AS visitors, count(*) FILTER (WHERE type = 'lead_created')::int AS leads FROM analytics_events WHERE ${where(range.from, range.to)} GROUP BY 1 ORDER BY visitors DESC LIMIT 50`); return result.map((row) => ({ source: text(row.source), visitors: n(row.visitors), leads: n(row.leads), conversionRate: n(row.visitors) ? (n(row.leads) / n(row.visitors)) * 100 : 0 })); }
  async campaigns(range: AnalyticsRange) { const result = await rows(sql`SELECT COALESCE(utm_campaign, 'campaignsiz') AS campaign, count(DISTINCT visitor_hash)::int AS visitors, count(*) FILTER (WHERE type = 'lead_created')::int AS leads, coalesce(sum(value_uzs) FILTER (WHERE type = 'payment_success'), 0)::int AS "revenueUzs" FROM analytics_events WHERE ${where(range.from, range.to)} GROUP BY 1 ORDER BY visitors DESC LIMIT 50`); return result.map((row) => ({ campaign: text(row.campaign), visitors: n(row.visitors), leads: n(row.leads), revenueUzs: n(row.revenueUzs) })); }
  async landingPages(range: AnalyticsRange) { const result = await rows(sql`SELECT path, count(DISTINCT visitor_hash)::int AS visitors, count(*) FILTER (WHERE type = 'lead_created')::int AS leads FROM analytics_events WHERE ${where(range.from, range.to)} GROUP BY path ORDER BY visitors DESC LIMIT 50`); return result.map((row) => ({ path: text(row.path), visitors: n(row.visitors), leads: n(row.leads), conversionRate: n(row.visitors) ? (n(row.leads) / n(row.visitors)) * 100 : 0 })); }
  async behaviour(range: AnalyticsRange) {
    const [result, entry, exit] = await Promise.all([
      rows(sql`SELECT path, count(*) FILTER (WHERE type = 'page_view')::int AS views, count(DISTINCT visitor_hash)::int AS visitors, coalesce(avg((props->>'engagedMs')::numeric) FILTER (WHERE type = 'page_leave'), 0)::int AS "averageEngagedMs", coalesce(avg((props->>'scrollDepth')::numeric) FILTER (WHERE type = 'page_leave'), 0)::int AS "averageScrollDepth" FROM analytics_events WHERE ${where(range.from, range.to)} AND type IN ('page_view', 'page_leave') GROUP BY path ORDER BY views DESC LIMIT 50`),
      rows(sql`WITH firsts AS (SELECT DISTINCT ON (session_id) session_id, path FROM analytics_events WHERE ${where(range.from, range.to)} AND type = 'page_view' ORDER BY session_id, occurred_at) SELECT path, count(*)::int AS visitors, 0::int AS views, 0::int AS exits, 0::int AS "exitRate", 0::int AS "averageEngagedMs", 0::int AS "averageScrollDepth" FROM firsts GROUP BY path ORDER BY visitors DESC LIMIT 50`),
      rows(sql`WITH lasts AS (SELECT DISTINCT ON (session_id) session_id, path FROM analytics_events WHERE ${where(range.from, range.to)} AND type = 'page_view' ORDER BY session_id, occurred_at DESC) SELECT l.path, count(*)::int AS exits, (SELECT count(DISTINCT session_id) FROM analytics_events WHERE ${where(range.from, range.to)} AND type = 'page_view')::int AS visitors, 0::int AS views, 0::int AS "exitRate", 0::int AS "averageEngagedMs", 0::int AS "averageScrollDepth" FROM lasts l GROUP BY l.path ORDER BY exits DESC LIMIT 50`),
    ]);
    const pages: PageRow[] = result.map((row) => ({ path: text(row.path), views: n(row.views), visitors: n(row.visitors), exits: 0, exitRate: 0, averageEngagedMs: n(row.averageEngagedMs), averageScrollDepth: n(row.averageScrollDepth) }));
    const pageFrom = (row: QueryRow, kind: "entry" | "exit"): PageRow => ({ path: text(row.path), views: n(row.views), visitors: n(row.visitors), exits: n(row.exits), exitRate: kind === "exit" && n(row.visitors) ? (n(row.exits) / n(row.visitors)) * 100 : 0, averageEngagedMs: 0, averageScrollDepth: 0 });
    const entryPages = entry.map((row) => pageFrom(row, "entry")); const exitPages = exit.map((row) => pageFrom(row, "exit"));
    const avg = pages.length ? pages.reduce((sum, row) => sum + row.averageEngagedMs, 0) / pages.length : 0; const scroll = pages.length ? pages.reduce((sum, row) => sum + row.averageScrollDepth, 0) / pages.length : 0;
    return { topPages: pages, entryPages, exitPages, averageEngagedMs: avg, averageScrollDepth: scroll };
  }
  async funnel(range: AnalyticsRange) { const result = await rows(sql`SELECT count(DISTINCT session_id) FILTER (WHERE type = 'page_view')::int AS visit, count(DISTINCT session_id) FILTER (WHERE type = 'diagnostic_start')::int AS diagnostic, count(DISTINCT session_id) FILTER (WHERE type = 'lead_created')::int AS lead, count(DISTINCT session_id) FILTER (WHERE type = 'signup')::int AS signup, count(DISTINCT session_id) FILTER (WHERE type = 'checkout_start')::int AS checkout, count(DISTINCT session_id) FILTER (WHERE type = 'payment_success')::int AS paid FROM analytics_events WHERE ${where(range.from, range.to)}`); const row = result[0] ?? {}; const step = (key: string, label: string, count: number): FunnelStep => ({ key, label, count, conversionFromPrevious: 0, conversionFromVisit: 0 }); return [step("visit", "Tashrif", n(row.visit)), step("diagnostic", "Diagnostika", n(row.diagnostic)), step("lead", "Lead", n(row.lead)), step("signup", "Ro'yxat", n(row.signup)), step("checkout", "To'lov", n(row.checkout)), step("paid", "To'lov qilgan", n(row.paid))]; }
  async students(range: AnalyticsRange) {
    const [summary, courseRows, attendanceRows] = await Promise.all([
      rows(sql`SELECT count(DISTINCT user_id) FILTER (WHERE type = 'lesson_start' AND user_id IS NOT NULL)::int AS "activeStudents", (SELECT count(*)::int FROM enrollments WHERE enrolled_at >= ${range.from} AND enrolled_at < ${range.to}) AS "newEnrollments", (SELECT count(*)::int FROM homework_submissions WHERE submitted_at >= ${range.from} AND submitted_at < ${range.to}) AS homework, (SELECT count(*)::int FROM enrollments WHERE status = 'active') AS "activeEnrollments" FROM analytics_events WHERE ${where(range.from, range.to)} AND type = 'lesson_start'`),
      rows(sql`SELECT c.id AS "courseId", c.title AS "courseTitle", count(DISTINCT e.user_id)::int AS started, count(lp.completed_at)::int AS completed, round(100.0 * count(lp.completed_at) / NULLIF(count(lp.user_id), 0), 1) AS "completionRate", (SELECT l2.title FROM lessons l2 JOIN course_sections s2 ON s2.id = l2.section_id LEFT JOIN lesson_progress lp2 ON lp2.lesson_id = l2.id WHERE s2.course_id = c.id GROUP BY l2.id ORDER BY count(lp2.completed_at) ASC NULLS FIRST LIMIT 1) AS "dropOffLesson" FROM courses c LEFT JOIN course_sections s ON s.course_id = c.id LEFT JOIN lessons l ON l.section_id = s.id LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id LEFT JOIN enrollments e ON e.cohort_id IN (SELECT id FROM cohorts WHERE course_id = c.id) GROUP BY c.id ORDER BY started DESC`),
      rows(sql`SELECT count(DISTINCT a.user_id) FILTER (WHERE a.type = 'lesson_start')::int AS attended, (SELECT count(*)::int FROM enrollments e2 JOIN cohorts c2 ON c2.id = e2.cohort_id WHERE e2.status = 'active') AS total FROM analytics_events a JOIN enrollments e ON e.user_id = a.user_id JOIN cohorts c ON c.id = e.cohort_id WHERE c.starts_at <= a.occurred_at AND (c.ends_at IS NULL OR c.ends_at >= a.occurred_at)`),
    ]);
    const row = summary[0] ?? {}; const attendance = attendanceRows[0] ?? {};
    return { activeStudents: n(row.activeStudents), newEnrollments: n(row.newEnrollments), courses: courseRows.map((course) => ({ courseId: text(course.courseId), courseTitle: text(course.courseTitle), started: n(course.started), completed: n(course.completed), completionRate: n(course.completionRate), dropOffLesson: typeof course.dropOffLesson === "string" ? course.dropOffLesson : null, dropOffCount: Math.max(0, n(course.started) - n(course.completed)) })), homeworkSubmissionRate: n(row.activeEnrollments) ? (n(row.homework) / (n(row.activeEnrollments) * 8)) * 100 : 0, cohortAttendanceRate: n(attendance.total) ? (n(attendance.attended) / n(attendance.total)) * 100 : 0 };
  }
  async sales(range: AnalyticsRange) {
    const [daily, byCourse, refunds, referrers] = await Promise.all([
      rows(sql`SELECT date_trunc('day', paid_at)::date::text AS date, coalesce(sum(amount_sum), 0)::int AS "revenueUzs", count(*)::int AS orders, avg(amount_sum)::int AS "averageOrderUzs" FROM payments WHERE status = 'paid' AND paid_at >= ${range.from} AND paid_at < ${range.to} GROUP BY 1 ORDER BY 1`),
      rows(sql`SELECT c.id AS "courseId", c.title AS "courseTitle", coalesce(sum(p.amount_sum), 0)::int AS "revenueUzs", count(p.id)::int AS orders FROM courses c LEFT JOIN cohorts co ON co.course_id = c.id LEFT JOIN enrollments e ON e.cohort_id = co.id LEFT JOIN payments p ON p.enrollment_id = e.id AND p.status = 'paid' AND p.paid_at >= ${range.from} AND p.paid_at < ${range.to} GROUP BY c.id ORDER BY "revenueUzs" DESC`),
      rows(sql`SELECT count(*)::int AS count, coalesce(sum(amount_sum), 0)::int AS value FROM payments WHERE status = 'refunded' AND paid_at >= ${range.from} AND paid_at < ${range.to}`),
      rows(sql`SELECT COALESCE(utm_source, referrer_host, 'direct') AS source, count(DISTINCT visitor_hash)::int AS visitors, count(*) FILTER (WHERE type = 'lead_created')::int AS leads FROM analytics_events WHERE ${where(range.from, range.to)} GROUP BY 1 ORDER BY visitors DESC LIMIT 20`),
    ]);
    const dailyRows = daily.map((row) => ({ date: text(row.date), revenueUzs: n(row.revenueUzs), orders: n(row.orders) }));
    const refund = refunds[0] ?? {};
    return { revenueByDay: dailyRows, revenueByCourse: byCourse.filter((row) => n(row.revenueUzs) > 0).map((row) => ({ courseId: text(row.courseId), courseTitle: text(row.courseTitle), revenueUzs: n(row.revenueUzs), orders: n(row.orders) })), averageOrderUzs: dailyRows.length ? dailyRows.reduce((sum, row) => sum + row.revenueUzs, 0) / dailyRows.reduce((sum, row) => sum + row.orders, 0) : 0, refundsCount: n(refund.count), refundsUzs: n(refund.value), topReferrers: referrers.map((row) => ({ source: text(row.source), visitors: n(row.visitors), leads: n(row.leads), conversionRate: n(row.visitors) ? (n(row.leads) / n(row.visitors)) * 100 : 0 })) };
  }
  async dimensions(range: AnalyticsRange, dimension: "device" | "country") { const column = dimension === "device" ? "device" : "COALESCE(country, 'Noma’lum')"; const result = await rows(sql`SELECT ${sql.raw(column)} AS name, count(DISTINCT visitor_hash)::int AS count FROM analytics_events WHERE ${where(range.from, range.to)} GROUP BY 1 ORDER BY count DESC`); return result.map((row) => ({ name: text(row.name), count: n(row.count) })); }
  async realtime(range: AnalyticsRange) { const result = await rows(sql`SELECT count(DISTINCT visitor_hash)::int AS count FROM analytics_events WHERE occurred_at >= ${range.to} - interval '5 minutes'`); return n(result[0]?.count); }
}
export const drizzleAnalyticsRepository: AnalyticsRepository = new DrizzleAnalyticsRepository();
