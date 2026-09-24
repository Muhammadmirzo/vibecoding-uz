// NOTE(W4-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, leads, users } from "@/db/schema";
import type { CreateLeadInput, UpdateLeadInput } from "@/lib/validations/crm";

export type DbExecutor = Pick<typeof db, "select" | "update" | "insert" | "delete">;

export interface LeadListItem {
  id: string;
  name: string;
  phone: string | null;
  source: string;
  quizAnswers: unknown;
  recommendedCourseId: string | null;
  recommendedCourseTitle: string | null;
  utm: unknown;
  status: string;
  assignedManagerId: string | null;
  assignedManagerName: string | null;
  nextContactAt: Date | null;
  createdAt: Date;
}

export type LeadRow = typeof leads.$inferSelect;

export interface LeadsRepository {
  listLeads(): Promise<LeadListItem[]>;
  findLeadById(id: string): Promise<LeadRow | null>;
  createLead(input: CreateLeadInput): Promise<LeadRow>;
  updateLead(id: string, patch: UpdateLeadInput): Promise<LeadRow | null>;
  deleteLead(id: string): Promise<LeadRow | null>;
}

export const drizzleLeadsRepository: LeadsRepository = {
  async listLeads() {
    return db
      .select({
        id: leads.id,
        name: leads.name,
        phone: leads.phone,
        source: leads.source,
        quizAnswers: leads.quizAnswers,
        recommendedCourseId: leads.recommendedCourseId,
        recommendedCourseTitle: courses.title,
        utm: leads.utm,
        status: leads.status,
        assignedManagerId: leads.assignedManagerId,
        assignedManagerName: users.fullName,
        nextContactAt: leads.nextContactAt,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .leftJoin(courses, eq(leads.recommendedCourseId, courses.id))
      .leftJoin(users, eq(leads.assignedManagerId, users.id))
      .orderBy(desc(leads.createdAt));
  },
  async findLeadById(id) {
    const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return row ?? null;
  },
  async createLead(input) {
    const [row] = await db
      .insert(leads)
      .values({
        name: input.name,
        phone: input.phone,
        source: input.source,
        status: input.status,
        recommendedCourseId: input.recommendedCourseId || null,
        quizAnswers: input.quizAnswers || null,
        utm: input.utm || null,
        assignedManagerId: input.assignedManagerId || null,
        nextContactAt: input.nextContactAt ? new Date(input.nextContactAt) : null,
      })
      .returning();
    return row;
  },
  async updateLead(id, patch) {
    const updateData: Partial<{
      name: string; phone: string | null; source: "quiz" | "free_lesson" | "form" | "telegram" | "expert" | "referral" | "manual";
      status: "new" | "contacted" | "consultation" | "pending" | "paid" | "rejected" | "cancelled";
      recommendedCourseId: string | null; quizAnswers: unknown; utm: unknown;
      assignedManagerId: string | null; nextContactAt: Date | null;
    }> = {};
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.phone !== undefined) updateData.phone = patch.phone;
    if (patch.source !== undefined) updateData.source = patch.source;
    if (patch.status !== undefined) updateData.status = patch.status;
    if (patch.recommendedCourseId !== undefined) updateData.recommendedCourseId = patch.recommendedCourseId;
    if (patch.quizAnswers !== undefined) updateData.quizAnswers = patch.quizAnswers;
    if (patch.utm !== undefined) updateData.utm = patch.utm;
    if (patch.assignedManagerId !== undefined) updateData.assignedManagerId = patch.assignedManagerId;
    if (patch.nextContactAt !== undefined) {
      updateData.nextContactAt = patch.nextContactAt ? new Date(patch.nextContactAt) : null;
    }
    const [row] = await db.update(leads).set(updateData).where(eq(leads.id, id)).returning();
    return row ?? null;
  },
  async deleteLead(id) {
    const [row] = await db.delete(leads).where(eq(leads.id, id)).returning();
    return row ?? null;
  },
};
