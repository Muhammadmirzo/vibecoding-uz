import type { InferSelectModel } from "drizzle-orm";
import type { users } from "../schema";

export type SeedUser = InferSelectModel<typeof users>;
export type AssignmentSeed = { id: string; title: string };

export interface SeedContext {
  adminUser: SeedUser | undefined;
  mentorUser: SeedUser | undefined;
  studentUsers: SeedUser[];
  targetExpressId?: string;
  targetBasicsId?: string;
  allAssignments: AssignmentSeed[];
  seededCohortId: string;
}
