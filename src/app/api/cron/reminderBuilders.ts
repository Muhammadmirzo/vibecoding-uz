import type { DripEnrollment, DripLesson, InactiveUser } from "./reminderTypes";

const DAY_MS = 24 * 60 * 60 * 1000;

export function resolveUnlockDate(dripValue: string | null, cohortStartsAt: Date | null): Date | null {
  if (!dripValue) return null;
  const parsed = new Date(dripValue);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const days = Number.parseInt(dripValue.replace(/[^\d]/g, ""), 10);
  if (!Number.isNaN(days) && cohortStartsAt) {
    return new Date(new Date(cohortStartsAt).getTime() + days * DAY_MS);
  }
  return null;
}

export function wasUnlockedRecently(unlockDate: Date, now: Date): boolean {
  const elapsed = now.getTime() - unlockDate.getTime();
  return elapsed >= 0 && elapsed <= DAY_MS;
}

export function findRecentDripUnlocks(
  enrollment: DripEnrollment,
  lessons: DripLesson[],
  now: Date,
): DripLesson[] {
  return lessons.flatMap((lesson) => {
    const unlockDate = resolveUnlockDate(lesson.dripValue, enrollment.cohortStartsAt);
    return unlockDate && wasUnlockedRecently(unlockDate, now) ? [lesson] : [];
  });
}

export function isInactive(user: Pick<InactiveUser, "lastLoginAt">, threshold: Date): boolean {
  return user.lastLoginAt === null || user.lastLoginAt < threshold;
}
