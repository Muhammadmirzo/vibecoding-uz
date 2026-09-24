import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, jobOpenings, leads } from "@/db/schema";
import { STATIC_JOB_OPENINGS } from "@/features/jobs/jobsData";

export interface JobApplyInput {
  jobId?: string | null;
  jobSlug?: string | null;
  jobTitle: string;
  fullName: string;
  phone: string;
  telegramUsername?: string | null;
  resumeUrl?: string | null;
  portfolioUrl?: string | null;
  experience?: string | null;
  coverLetter?: string | null;
}

export class JobApplyError extends Error {
  constructor(public code: "UNKNOWN_JOB" | "DUPLICATE" | "INACTIVE", message: string) {
    super(message);
  }
}

export interface JobApplicationsRepository {
  findDbOpening(id: string): Promise<{ id: string; title: string; status: string } | null>;
  hasRecentApplication(phone: string, jobKey: string, since: Date): Promise<boolean>;
  insertApplication(input: JobApplyInput & { resolvedJobKey: string }): Promise<{ id: string }>;
  recordAudit(input: { action: string; entityId: string; details: Record<string, unknown>; ip: string }): Promise<void>;
}

function jobKeyOf(input: JobApplyInput): string | null {
  if (input.jobId) return `id:${input.jobId}`;
  if (input.jobSlug) return `slug:${input.jobSlug}`;
  return null;
}

export const drizzleJobApplicationsRepository: JobApplicationsRepository = {
  async findDbOpening(id) {
    const [row] = await db.select({ id: jobOpenings.id, title: jobOpenings.title, status: jobOpenings.status })
      .from(jobOpenings).where(eq(jobOpenings.id, id)).limit(1);
    return row ?? null;
  },
  async hasRecentApplication(phone, jobKey, since) {
    const rows = await db.select({ id: leads.id, quizAnswers: leads.quizAnswers }).from(leads)
      .where(and(eq(leads.phone, phone), gte(leads.createdAt, since)));
    return rows.some((row) => {
      const answers = row.quizAnswers as Record<string, unknown> | null;
      return answers?.applicationType === "job_application" && answers?.jobKey === jobKey;
    });
  },
  async insertApplication(input) {
    const [row] = await db.insert(leads).values({
      name: input.fullName,
      phone: input.phone,
      source: "form",
      status: "new",
      quizAnswers: {
        applicationType: "job_application",
        jobKey: input.resolvedJobKey,
        jobId: input.jobId ?? null,
        jobSlug: input.jobSlug ?? null,
        jobTitle: input.jobTitle,
        telegramUsername: input.telegramUsername || null,
        resumeUrl: input.resumeUrl || null,
        portfolioUrl: input.portfolioUrl || null,
        experience: input.experience || null,
        coverLetter: input.coverLetter || null,
        appliedAt: new Date().toISOString(),
      },
    }).returning({ id: leads.id });
    return row;
  },
  async recordAudit(input) {
    await db.insert(auditLogs).values({
      action: input.action, entityType: "lead", entityId: input.entityId,
      details: input.details, ipAddress: input.ip,
    });
  },
};

/**
 * Job application use case: the opening must exist (DB row by UUID, or an
 * active static listing by slug), and the same phone cannot re-apply to the
 * same opening within 24 hours.
 */
export async function applyForJob(
  repo: JobApplicationsRepository,
  input: JobApplyInput,
  ip: string,
  now: Date = new Date(),
): Promise<{ leadId: string }> {
  const jobKey = jobKeyOf(input);
  if (!jobKey) throw new JobApplyError("UNKNOWN_JOB", "Vakansiya tanlanishi lozim");

  if (input.jobId) {
    const opening = await repo.findDbOpening(input.jobId);
    if (!opening) throw new JobApplyError("UNKNOWN_JOB", "Vakansiya topilmadi");
    if (opening.status !== "active") throw new JobApplyError("INACTIVE", "Bu vakansiya uchun qabul yopilgan");
  } else {
    const listed = STATIC_JOB_OPENINGS.find((job) => job.slug === input.jobSlug);
    if (!listed) throw new JobApplyError("UNKNOWN_JOB", "Vakansiya topilmadi");
    if (listed.status !== "active") throw new JobApplyError("INACTIVE", "Bu vakansiya uchun qabul yopilgan");
  }

  const duplicate = await repo.hasRecentApplication(input.phone, jobKey, new Date(now.getTime() - 24 * 60 * 60 * 1000));
  if (duplicate) throw new JobApplyError("DUPLICATE", "Bu vakansiya uchun so'nggi 24 soat ichida ariza yuborilgan");

  const inserted = await repo.insertApplication({ ...input, resolvedJobKey: jobKey });
  await repo.recordAudit({
    action: "job.apply",
    entityId: inserted.id,
    details: { candidate: input.fullName, phone: input.phone, jobTitle: input.jobTitle, jobKey },
    ip,
  });
  return { leadId: inserted.id };
}
