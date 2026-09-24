import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userProfiles, users } from "@/db/schema";

export type DbExecutor = Pick<typeof db, "select" | "update" | "insert">;

export interface UserFields {
  fullName?: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface ProfileFields {
  birthDate?: Date | null;
  city?: string | null;
  profession?: string | null;
  goal?: string | null;
  bio?: string | null;
}

export interface MeRecord {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  locale: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  profile: {
    birthDate: Date | null;
    city: string | null;
    profession: string | null;
    goal: string | null;
    source: string | null;
    bio: string | null;
  } | null;
}

/** Profile reads + single/multi-table writes (Tx variants for atomicity). */
export interface ProfileRepository {
  findMe(userId: string): Promise<MeRecord | null>;
  findPasswordHash(userId: string): Promise<{ id: string; passwordHash: string | null } | null>;
  setPasswordHash(userId: string, passwordHash: string): Promise<void>;
  updateUserFields(userId: string, patch: UserFields): Promise<void>;
  updateUserFieldsTx(ex: DbExecutor, userId: string, patch: UserFields): Promise<void>;
  upsertProfileFields(userId: string, patch: ProfileFields): Promise<void>;
  upsertProfileFieldsTx(ex: DbExecutor, userId: string, patch: ProfileFields): Promise<void>;
}

async function findMeWith(ex: DbExecutor, userId: string): Promise<MeRecord | null> {
  const [row] = await ex
    .select({ user: users, profile: userProfiles })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(eq(users.id, userId))
    .limit(1);
  if (!row?.user) return null;
  const { user, profile } = row;
  return {
    id: user.id, phone: user.phone, email: user.email, fullName: user.fullName,
    avatarUrl: user.avatarUrl, role: user.role, locale: user.locale,
    createdAt: user.createdAt, lastLoginAt: user.lastLoginAt,
    profile: profile
      ? {
        birthDate: profile.birthDate, city: profile.city, profession: profile.profession,
        goal: profile.goal, source: profile.source, bio: profile.bio,
      }
      : null,
  };
}

async function updateUserWith(ex: DbExecutor, userId: string, patch: UserFields): Promise<void> {
  await ex.update(users).set(patch).where(eq(users.id, userId));
}

async function upsertProfileWith(ex: DbExecutor, userId: string, patch: ProfileFields): Promise<void> {
  const values = { userId, ...patch };
  await ex.insert(userProfiles).values(values).onConflictDoUpdate({
    target: userProfiles.userId,
    set: patch,
  });
}

export const drizzleProfileRepository: ProfileRepository = {
  findMe: (userId) => findMeWith(db, userId),
  async findPasswordHash(userId) {
    const [row] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return row ?? null;
  },
  async setPasswordHash(userId, passwordHash) {
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  },
  updateUserFields: (userId, patch) => updateUserWith(db, userId, patch),
  updateUserFieldsTx: (ex, userId, patch) => updateUserWith(ex, userId, patch),
  upsertProfileFields: (userId, patch) => upsertProfileWith(db, userId, patch),
  upsertProfileFieldsTx: (ex, userId, patch) => upsertProfileWith(ex, userId, patch),
};
