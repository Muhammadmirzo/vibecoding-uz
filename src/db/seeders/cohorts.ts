import { db } from "../index";
import { cohorts } from "../schema";
import type { SeedContext } from "./types";

export async function seedCohorts(context: SeedContext): Promise<void> {
  console.log("3/10 Cohorts seeding...");
  if (!context.targetExpressId) return;
  const [cohort] = await db
    .insert(cohorts)
    .values({
      courseId: context.targetExpressId,
      name: "Sentabr / Oktyabr Guruhi (Express)",
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000),
      seats: 30,
      priceSum: "2990000.00",
      earlyPriceSum: "2490000.00",
      earlyDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      telegramChatId: "-100192837465",
      status: "active",
    })
    .onConflictDoNothing()
    .returning();
  if (cohort) context.seededCohortId = cohort.id;
}
