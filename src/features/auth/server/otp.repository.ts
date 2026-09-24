// NOTE(W5-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { and, desc, eq, gte, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";

export type OtpRecord = typeof otpCodes.$inferSelect;

export interface OtpRepository {
  findActiveOtp(phone: string, purpose: string, now: Date): Promise<OtpRecord | null>;
  bumpAttempts(id: string, attempts: number): Promise<void>;
  markUsed(id: string, usedAt: Date): Promise<void>;
  insertOtp(input: { phone: string; codeHash: string; purpose: string; expiresAt: Date }): Promise<void>;
}

export const drizzleOtpRepository: OtpRepository = {
  async findActiveOtp(phone, purpose, now) {
    const [row] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, phone),
          eq(otpCodes.purpose, purpose),
          isNull(otpCodes.usedAt),
          gte(otpCodes.expiresAt, now),
          lt(otpCodes.attempts, 5),
        ),
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);
    return row ?? null;
  },
  async bumpAttempts(id, attempts) {
    await db.update(otpCodes).set({ attempts }).where(eq(otpCodes.id, id));
  },
  async markUsed(id, usedAt) {
    await db.update(otpCodes).set({ usedAt }).where(eq(otpCodes.id, id));
  },
  // NOTE: intentionally no `.returning()` — the hardening test mocks
  // `db.insert` as `{ values: () => Promise<[]> }`.
  async insertOtp(input) {
    await db.insert(otpCodes).values({
      phone: input.phone,
      codeHash: input.codeHash,
      purpose: input.purpose,
      expiresAt: input.expiresAt,
    });
  },
};
