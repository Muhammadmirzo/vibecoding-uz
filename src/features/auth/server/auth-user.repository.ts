// NOTE(W5-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, userProfiles, users } from "@/db/schema";
import type { DbExecutor } from "@/features/payments/server/payments.repository";

export type AuthUser = typeof users.$inferSelect;

export interface LoginFieldsPatch {
  lastLoginAt?: Date;
  fullName?: string;
  tgUsername?: string | null;
  avatarUrl?: string | null;
}

export interface CredentialsPatch {
  passwordHash?: string;
  phone?: string;
  email?: string | null;
}

export interface AuthAuditInput {
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ip: string;
}

export interface AuthUserRepository {
  findByPhoneOrEmail(phone: string, emailLower: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  findByPhone(phone: string): Promise<AuthUser | null>;
  findByEmail(email: string): Promise<Pick<AuthUser, "id"> | null>;
  findByTgId(tgId: string): Promise<AuthUser | null>;
  ensureProfileTx(ex: DbExecutor, userId: string): Promise<void>;
  updateLoginFieldsTx(ex: DbExecutor, userId: string, patch: LoginFieldsPatch): Promise<void>;
  updateCredentialsTx(ex: DbExecutor, userId: string, patch: CredentialsPatch): Promise<void>;
  insertAuthAuditTx(ex: DbExecutor, input: AuthAuditInput): Promise<void>;
}

async function firstBy<T>(rows: T[]): Promise<T | null> {
  return rows[0] ?? null;
}

export const drizzleAuthUserRepository: AuthUserRepository = {
  async findByPhoneOrEmail(phone, emailLower) {
    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.phone, phone), eq(users.email, emailLower)))
      .limit(1);
    return firstBy(rows);
  },
  async findById(id) {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return firstBy(rows);
  },
  async findByPhone(phone) {
    const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return firstBy(rows);
  },
  async findByEmail(email) {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return firstBy(rows);
  },
  async findByTgId(tgId) {
    const rows = await db.select().from(users).where(eq(users.tgUserId, tgId)).limit(1);
    return firstBy(rows);
  },
  async ensureProfileTx(ex, userId) {
    await ex.insert(userProfiles).values({ userId }).onConflictDoNothing();
  },
  async updateLoginFieldsTx(ex, userId, patch) {
    await ex.update(users).set(patch).where(eq(users.id, userId));
  },
  async updateCredentialsTx(ex, userId, patch) {
    await ex.update(users).set(patch).where(eq(users.id, userId));
  },
  async insertAuthAuditTx(ex, input) {
    await ex.insert(auditLogs).values({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
      ipAddress: input.ip,
    });
  },
};
