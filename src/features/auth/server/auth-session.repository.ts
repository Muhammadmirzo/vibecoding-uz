// NOTE(W5-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import type { DbExecutor } from "@/features/payments/server/payments.repository";

export interface NewSessionInput {
  userId: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}

export interface AuthSessionRepository {
  createSession(input: NewSessionInput): Promise<{ id: string } | undefined>;
  createSessionTx(ex: DbExecutor, input: NewSessionInput): Promise<{ id: string } | undefined>;
  deleteSession(sessionId: string): Promise<void>;
}

async function insertSession(ex: DbExecutor, input: NewSessionInput): Promise<{ id: string } | undefined> {
  const [row] = await ex
    .insert(sessions)
    .values({
      userId: input.userId,
      expiresAt: input.expiresAt,
      userAgent: input.userAgent,
      ip: input.ip,
    })
    .returning({ id: sessions.id });
  return row;
}

export const drizzleAuthSessionRepository: AuthSessionRepository = {
  async createSession(input) {
    return insertSession(db, input);
  },
  async createSessionTx(ex, input) {
    return insertSession(ex, input);
  },
  async deleteSession(sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  },
};
