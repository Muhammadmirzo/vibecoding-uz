/**
 * Read-only Drizzle queries backing the MCP tools.
 * The DB client is loaded lazily (dynamic import) so unit tests that inject
 * fake deps never touch a database. No UI/Next imports here: this module
 * runs inside the standalone MCP stdio process.
 */
import { and, count, desc, eq, gte, inArray, sum } from "drizzle-orm";
import {
  cohorts,
  courses,
  enrollments,
  homeworkSubmissions,
  leads,
  payments,
} from "../../src/db/schema";

type DbClient = Awaited<ReturnType<typeof loadDb>>;

async function loadDb() {
  const mod = await import("../../src/db");
  return mod.db;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function firstCount(rows: { n: number }[]): number {
  const row = rows[0];
  return row === undefined ? 0 : row.n;
}

// --- leads ---------------------------------------------------------------

const LEAD_STATUSES = ["new", "contacted", "consultation", "pending", "paid", "rejected", "cancelled"] as const;

export type McpLeadStatus = (typeof LEAD_STATUSES)[number];

export function isLeadStatus(value: string): value is McpLeadStatus {
  for (const known of LEAD_STATUSES) {
    if (known === value) return true;
  }
  return false;
}

export interface LeadRow {
  id: string;
  name: string;
  phone: string | null;
  telegram: string | null;
  source: string;
  status: string;
  createdAt: string;
}

const LEAD_COLUMNS = {
  id: leads.id,
  name: leads.name,
  phone: leads.phone,
  telegram: leads.telegram,
  source: leads.source,
  status: leads.status,
  createdAt: leads.createdAt,
};

export async function queryLeadRows(status: string, limit: number): Promise<LeadRow[]> {
  const db: DbClient = await loadDb();
  const capped = Math.max(1, Math.min(limit, 100));
  if (!isLeadStatus(status) && status !== "all") return [];
  const rows =
    status === "all" || !isLeadStatus(status)
      ? await db.select(LEAD_COLUMNS).from(leads).orderBy(desc(leads.createdAt)).limit(capped)
      : await db
          .select(LEAD_COLUMNS)
          .from(leads)
          .where(eq(leads.status, status))
          .orderBy(desc(leads.createdAt))
          .limit(capped);
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

// --- KPIs ----------------------------------------------------------------

export interface KpiCounts {
  totalLeads: number;
  activeStudents: number;
  pendingHomework: number;
  paidPayments: number;
  paidRevenueTiyin: number;
  totalCohorts: number;
}

export async function queryKpiCounts(since: Date | null): Promise<KpiCounts> {
  const db: DbClient = await loadDb();
  const [leadRows, enrollmentRows, homeworkRows, paidRows, revenueRows, cohortRows] = await Promise.all([
    db
      .select({ n: count() })
      .from(leads)
      .where(since ? gte(leads.createdAt, since) : undefined),
    db.select({ n: count() }).from(enrollments).where(eq(enrollments.status, "active")),
    db
      .select({ n: count() })
      .from(homeworkSubmissions)
      .where(inArray(homeworkSubmissions.status, ["submitted", "reviewing"])),
    db
      .select({ n: count() })
      .from(payments)
      .where(
        since
          ? and(eq(payments.status, "paid"), gte(payments.paidAt, since))
          : eq(payments.status, "paid")
      ),
    db
      .select({ total: sum(payments.amountTiyin) })
      .from(payments)
      .where(
        since
          ? and(eq(payments.status, "paid"), gte(payments.paidAt, since))
          : eq(payments.status, "paid")
      ),
    db.select({ n: count() }).from(cohorts),
  ]);
  const revenue = revenueRows[0]?.total ?? null;
  return {
    totalLeads: firstCount(leadRows),
    activeStudents: firstCount(enrollmentRows),
    pendingHomework: firstCount(homeworkRows),
    paidPayments: firstCount(paidRows),
    paidRevenueTiyin: revenue === null ? 0 : Number(revenue),
    totalCohorts: firstCount(cohortRows),
  };
}

// --- cohorts --------------------------------------------------------------

export interface CohortRow {
  id: string;
  name: string;
  courseTitle: string;
  startsAt: string;
  seats: number;
  status: string;
  priceSum: string;
  earlyPriceSum: string | null;
  earlyDeadline: string | null;
  enrolled: number;
  remaining: number;
}

export async function queryCohortRows(cohortId: string | undefined): Promise<CohortRow[]> {
  const db: DbClient = await loadDb();
  const base = db
    .select({
      id: cohorts.id,
      name: cohorts.name,
      startsAt: cohorts.startsAt,
      seats: cohorts.seats,
      status: cohorts.status,
      priceSum: cohorts.priceSum,
      earlyPriceSum: cohorts.earlyPriceSum,
      earlyDeadline: cohorts.earlyDeadline,
      courseTitle: courses.title,
    })
    .from(cohorts)
    .innerJoin(courses, eq(cohorts.courseId, courses.id));
  const rows = cohortId ? await base.where(eq(cohorts.id, cohortId)) : await base;
  const counts =
    cohortId === undefined
      ? await db
          .select({ cohortId: enrollments.cohortId, n: count() })
          .from(enrollments)
          .groupBy(enrollments.cohortId)
      : await db
          .select({ cohortId: enrollments.cohortId, n: count() })
          .from(enrollments)
          .where(eq(enrollments.cohortId, cohortId))
          .groupBy(enrollments.cohortId);
  const byCohort = new Map<string, number>();
  for (const c of counts) byCohort.set(c.cohortId, c.n);
  return rows.map((r) => {
    const enrolled = byCohort.get(r.id) ?? 0;
    return {
      id: r.id,
      name: r.name,
      courseTitle: r.courseTitle,
      startsAt: r.startsAt.toISOString(),
      seats: r.seats,
      status: r.status,
      priceSum: r.priceSum,
      earlyPriceSum: r.earlyPriceSum,
      earlyDeadline: r.earlyDeadline ? r.earlyDeadline.toISOString() : null,
      enrolled,
      remaining: Math.max(0, r.seats - enrolled),
    };
  });
}
