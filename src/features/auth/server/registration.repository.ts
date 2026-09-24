import { users, userProfiles } from "@/db/schema";
import type { DbExecutor } from "@/features/payments/server/payments.repository";

export interface NewUserInput {
  phone: string;
  fullName: string;
}

export type CreatedUser = typeof users.$inferSelect;

export interface RegistrationRepository {
  createUserTx(ex: DbExecutor, input: NewUserInput): Promise<CreatedUser>;
  createProfileTx(ex: DbExecutor, userId: string): Promise<void>;
}

async function createUser(ex: DbExecutor, input: NewUserInput): Promise<CreatedUser> {
  const [row] = await ex
    .insert(users)
    .values({ phone: input.phone, fullName: input.fullName, role: "student", lastLoginAt: new Date() })
    .returning();
  return row;
}

export const drizzleRegistrationRepository: RegistrationRepository = {
  createUserTx: (ex, input) => createUser(ex, input),
  createProfileTx: async (ex, userId) => {
    await ex.insert(userProfiles).values({ userId }).onConflictDoNothing();
  },
};
