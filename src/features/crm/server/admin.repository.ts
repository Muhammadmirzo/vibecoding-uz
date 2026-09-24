// NOTE(W4-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { desc, eq, like, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, siteSettings, users } from "@/db/schema";

export type DbExecutor = Pick<typeof db, "select" | "update" | "insert" | "delete">;

export interface AuditLogItem {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: unknown;
  ipAddress: string | null;
  createdAt: Date;
  userName: string | null;
}

export interface AdminRepository {
  listAuditLogs(filter: { action: string; search?: string; limit: number }): Promise<AuditLogItem[]>;
  getAllSettings(): Promise<{ key: string; value: unknown }[]>;
  upsertSettingTx(ex: DbExecutor, key: string, value: unknown): Promise<void>;
  recordAuditTx(
    ex: DbExecutor,
    input: { action: string; entityType: string; entityId?: string; details: Record<string, unknown>; ip: string },
  ): Promise<void>;
}

function buildAuditConditions(action: string, search?: string): SQL<unknown> | undefined {
  const conditions: SQL<unknown>[] = [];
  if (action && action !== "all") {
    conditions.push(eq(auditLogs.action, action));
  }
  if (search) {
    conditions.push(
      or(
        like(auditLogs.action, `%${search}%`),
        like(auditLogs.entityType, `%${search}%`),
        like(auditLogs.userEmail, `%${search}%`),
      ) as SQL<unknown>,
    );
  }
  // Preserve legacy route semantics: filters combine with OR.
  return conditions.length > 0 ? (or(...conditions) as SQL<unknown>) : undefined;
}

export const drizzleAdminRepository: AdminRepository = {
  async listAuditLogs(filter) {
    return db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userEmail: auditLogs.userEmail,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        userName: users.fullName,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(buildAuditConditions(filter.action, filter.search))
      .orderBy(desc(auditLogs.createdAt))
      .limit(filter.limit);
  },
  async getAllSettings() {
    const rows = await db.select().from(siteSettings);
    return rows.map((r) => ({ key: r.key, value: r.value }));
  },
  async upsertSettingTx(ex, key, value) {
    const existing = await ex.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    if (existing.length > 0) {
      await ex.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
    } else {
      await ex.insert(siteSettings).values({ key, value, updatedAt: new Date() });
    }
  },
  async recordAuditTx(ex, input) {
    await ex.insert(auditLogs).values({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
      ipAddress: input.ip,
    });
  },
};
