// NOTE(W4-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { count, desc, eq, like, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, enrollments, users } from "@/db/schema";

export type DbExecutor = Pick<typeof db, "select" | "update" | "insert" | "delete">;

export type StaffRole = typeof users.$inferSelect.role;

export interface UserListItem {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  tgUsername: string | null;
  role: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  enrolledCount: number;
}

export interface CreateUserInput {
  phone: string;
  fullName: string;
  email: string | null;
  passwordHash: string;
  role: StaffRole;
}

export type UserPublicRow = Pick<
  typeof users.$inferSelect,
  "id" | "phone" | "email" | "fullName" | "role" | "createdAt"
>;

export interface RecordAuditInput {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: Record<string, unknown>;
  ip: string;
}

export interface UsersRepository {
  listUsers(filter: { role: string; search?: string }): Promise<UserListItem[]>;
  findByPhone(phone: string): Promise<{ id: string } | null>;
  findByEmail(email: string): Promise<{ id: string } | null>;
  createUserTx(ex: DbExecutor, input: CreateUserInput): Promise<UserPublicRow>;
  setRoleTx(ex: DbExecutor, id: string, role: StaffRole): Promise<UserPublicRow | null>;
  recordAuditTx(ex: DbExecutor, input: RecordAuditInput): Promise<void>;
}

function buildConditions(role: string, search?: string): SQL<unknown> | undefined {
  const conditions: SQL<unknown>[] = [];
  if (role && role !== "all") {
    conditions.push(eq(users.role, role as StaffRole));
  }
  if (search) {
    conditions.push(
      or(like(users.fullName, `%${search}%`), like(users.phone, `%${search}%`), like(users.email, `%${search}%`)) as SQL<unknown>,
    );
  }
  // Preserve legacy route semantics: filters combine with OR.
  return conditions.length > 0 ? (or(...conditions) as SQL<unknown>) : undefined;
}

async function recordAudit(ex: DbExecutor, input: RecordAuditInput): Promise<void> {
  await ex.insert(auditLogs).values({
    userId: input.userId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    details: input.details,
    ipAddress: input.ip,
  });
}

const publicColumns = {
  id: users.id,
  phone: users.phone,
  email: users.email,
  fullName: users.fullName,
  role: users.role,
  createdAt: users.createdAt,
};

export const drizzleUsersRepository: UsersRepository = {
  async listUsers(filter) {
    const rows = await db
      .select({
        id: users.id,
        phone: users.phone,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        tgUsername: users.tgUsername,
        role: users.role,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        enrolledCount: count(enrollments.id),
      })
      .from(users)
      .leftJoin(enrollments, eq(enrollments.userId, users.id))
      .where(buildConditions(filter.role, filter.search))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt));
    return rows.map((u) => ({ ...u, enrolledCount: Number(u.enrolledCount || 0) }));
  },
  async findByPhone(phone) {
    const [row] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
    return row ?? null;
  },
  async findByEmail(email) {
    const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
  },
  async createUserTx(ex, input) {
    const [row] = await ex.insert(users).values(input).returning(publicColumns);
    return row;
  },
  async setRoleTx(ex, id, role) {
    const [row] = await ex.update(users).set({ role }).where(eq(users.id, id)).returning(publicColumns);
    return row ?? null;
  },
  recordAuditTx: (ex, input) => recordAudit(ex, input),
};
