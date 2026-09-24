// NOTE(W4-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cohorts, courses, enrollments } from "@/db/schema";
import type { CreateCohortInput, UpdateCohortInput } from "@/lib/validations/crm";

export type DbExecutor = Pick<typeof db, "select" | "update" | "insert" | "delete">;

export interface CohortListItem {
  cohort: typeof cohorts.$inferSelect;
  courseTitle: string | null;
  courseSlug: string | null;
  enrolledCount: number;
}

export type CohortRow = typeof cohorts.$inferSelect;

export interface CohortsRepository {
  listCohorts(): Promise<CohortListItem[]>;
  findCohortById(id: string): Promise<CohortRow | null>;
  createCohort(input: CreateCohortInput): Promise<CohortRow>;
  updateCohort(id: string, patch: UpdateCohortInput): Promise<CohortRow | null>;
  deleteCohort(id: string): Promise<CohortRow | null>;
}

export const drizzleCohortsRepository: CohortsRepository = {
  async listCohorts() {
    const rows = await db
      .select({
        cohort: cohorts,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        enrolledCount: count(enrollments.id),
      })
      .from(cohorts)
      .leftJoin(courses, eq(cohorts.courseId, courses.id))
      .leftJoin(enrollments, eq(enrollments.cohortId, cohorts.id))
      .groupBy(cohorts.id, courses.id)
      .orderBy(desc(cohorts.startsAt));
    return rows.map((r) => ({ ...r, enrolledCount: Number(r.enrolledCount || 0) }));
  },
  async findCohortById(id) {
    const [row] = await db.select().from(cohorts).where(eq(cohorts.id, id)).limit(1);
    return row ?? null;
  },
  async createCohort(input) {
    const [row] = await db
      .insert(cohorts)
      .values({
        courseId: input.courseId,
        name: input.name,
        startsAt: new Date(input.startsAt),
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        seats: input.seats,
        priceSum: input.priceSum,
        earlyPriceSum: input.earlyPriceSum || null,
        earlyDeadline: input.earlyDeadline ? new Date(input.earlyDeadline) : null,
        telegramChatId: input.telegramChatId || null,
        status: input.status,
      })
      .returning();
    return row;
  },
  async updateCohort(id, patch) {
    const updateData: Partial<{
      courseId: string; name: string; startsAt: Date; endsAt: Date | null;
      seats: number; priceSum: string; earlyPriceSum: string | null;
      earlyDeadline: Date | null; telegramChatId: string | null; status: string;
    }> = {};
    if (patch.courseId !== undefined) updateData.courseId = patch.courseId;
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.startsAt !== undefined) updateData.startsAt = new Date(patch.startsAt);
    if (patch.endsAt !== undefined) updateData.endsAt = patch.endsAt ? new Date(patch.endsAt) : null;
    if (patch.seats !== undefined) updateData.seats = patch.seats;
    if (patch.priceSum !== undefined) updateData.priceSum = patch.priceSum;
    if (patch.earlyPriceSum !== undefined) updateData.earlyPriceSum = patch.earlyPriceSum;
    if (patch.earlyDeadline !== undefined) {
      updateData.earlyDeadline = patch.earlyDeadline ? new Date(patch.earlyDeadline) : null;
    }
    if (patch.telegramChatId !== undefined) updateData.telegramChatId = patch.telegramChatId;
    if (patch.status !== undefined) updateData.status = patch.status;
    const [row] = await db.update(cohorts).set(updateData).where(eq(cohorts.id, id)).returning();
    return row ?? null;
  },
  async deleteCohort(id) {
    const [row] = await db.delete(cohorts).where(eq(cohorts.id, id)).returning();
    return row ?? null;
  },
};
