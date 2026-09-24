import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { apiRefreshTokens } from "@/db/schema";

export type RefreshTokenRow = typeof apiRefreshTokens.$inferSelect;

export interface RefreshTokenRepository {
  insert(input: Omit<typeof apiRefreshTokens.$inferInsert, "id" | "createdAt">): Promise<RefreshTokenRow>;
  findByHash(tokenHash: string): Promise<RefreshTokenRow | null>;
  touchLastUsed(id: string): Promise<void>;
  revoke(id: string, rotatedTo?: string): Promise<void>;
  /** Atomically revokes an active row; false when another request already did. */
  claim(id: string): Promise<boolean>;
  revokeFamily(userId: string, deviceId: string): Promise<number>;
  revokeAllForUser(userId: string): Promise<number>;
  listActiveForUser(userId: string): Promise<RefreshTokenRow[]>;
  findOwned(id: string, userId: string): Promise<RefreshTokenRow | null>;
  markRotated(oldId: string, newId: string): Promise<void>;
}

async function insert(
  input: Omit<typeof apiRefreshTokens.$inferInsert, "id" | "createdAt">,
): Promise<RefreshTokenRow> {
  const [row] = await db.insert(apiRefreshTokens).values(input).returning();
  if (!row) throw new Error("Refresh token insert failed");
  return row;
}

export const drizzleRefreshTokenRepository: RefreshTokenRepository = {
  insert,
  async findByHash(tokenHash) {
    const [row] = await db.select().from(apiRefreshTokens).where(eq(apiRefreshTokens.tokenHash, tokenHash)).limit(1);
    return row ?? null;
  },
  async touchLastUsed(id) {
    await db.update(apiRefreshTokens).set({ lastUsedAt: new Date() }).where(eq(apiRefreshTokens.id, id));
  },
  async revoke(id) {
    await db.update(apiRefreshTokens).set({ revokedAt: new Date() }).where(eq(apiRefreshTokens.id, id));
  },
  async claim(id) {
    const rows = await db.update(apiRefreshTokens).set({ revokedAt: new Date() })
      .where(and(eq(apiRefreshTokens.id, id), isNull(apiRefreshTokens.revokedAt)))
      .returning({ id: apiRefreshTokens.id });
    return rows.length > 0;
  },
  async revokeFamily(userId, deviceId) {
    const rows = await db.update(apiRefreshTokens).set({ revokedAt: new Date() })
      .where(and(eq(apiRefreshTokens.userId, userId), eq(apiRefreshTokens.deviceId, deviceId), isNull(apiRefreshTokens.revokedAt)))
      .returning({ id: apiRefreshTokens.id });
    return rows.length;
  },
  async revokeAllForUser(userId) {
    const rows = await db.update(apiRefreshTokens).set({ revokedAt: new Date() })
      .where(and(eq(apiRefreshTokens.userId, userId), isNull(apiRefreshTokens.revokedAt)))
      .returning({ id: apiRefreshTokens.id });
    return rows.length;
  },
  async listActiveForUser(userId) {
    return db.select().from(apiRefreshTokens)
      .where(and(eq(apiRefreshTokens.userId, userId), isNull(apiRefreshTokens.revokedAt)));
  },
  async findOwned(id, userId) {
    const [row] = await db.select().from(apiRefreshTokens)
      .where(and(eq(apiRefreshTokens.id, id), eq(apiRefreshTokens.userId, userId))).limit(1);
    return row ?? null;
  },
  async markRotated(oldId, newId) {
    await db.update(apiRefreshTokens).set({ rotatedFrom: oldId }).where(eq(apiRefreshTokens.id, newId));
  },
};
