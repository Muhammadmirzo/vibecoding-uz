import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, leads } from "@/db/schema";
import { maskPhone, safePage, textValue, type Page } from "./pagination";

export async function leadsList(query: { limit?: number; cursor?: string; status?: string; search?: string }, pii: boolean): Promise<Page<Record<string, unknown>>> {
  return safePage(query, async (limit, offset) => {
    const status = query.status || null; const search = query.search?.trim() ? `%${query.search.trim()}%` : null;
    const where = sql`(${status}::text IS NULL OR ${leads.status} = ${status}) AND (${search}::text IS NULL OR ${leads.name} ILIKE ${search} OR ${leads.phone} ILIKE ${search})`;
    const [rows, total] = await Promise.all([
      db.select({ id: leads.id, name: leads.name, phone: leads.phone, telegram: leads.telegram, source: leads.source, status: leads.status, createdAt: leads.createdAt }).from(leads).where(where).orderBy(desc(leads.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(leads).where(where),
    ]);
    return { rows: rows.map((row) => ({ id: row.id, name: row.name, phone: maskPhone(row.phone, pii), telegram: pii ? row.telegram : null, source: row.source, status: row.status, createdAt: row.createdAt.toISOString() })), total: Number(total[0]?.count ?? 0) };
  });
}

export async function updateLeadStatus(id: string, status: string, actorId: string) {
  const [row] = await db.update(leads).set({ status: sql`${status}::lead_status` }).where(eq(leads.id, id)).returning({ id: leads.id, name: leads.name, status: leads.status, updated: leads.status });
  if (!row) return null;
  await db.insert(auditLogs).values({ userId: actorId, action: "mcp.lead.status_update", entityType: "lead", entityId: id, details: { status: textValue(row.updated) } });
  return { id: row.id, name: row.name, status: row.updated };
}
