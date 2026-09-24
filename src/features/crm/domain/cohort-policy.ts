/**
 * Pure cohort presentation policies (no I/O).
 * Used by the cohorts service to format admin list rows.
 */

export interface EarlyBirdInfo {
  isEarlyBirdActive: boolean;
  earlyBirdDaysLeft: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function earlyBirdInfo(earlyDeadline: Date | string | null, now: Date = new Date()): EarlyBirdInfo {
  if (!earlyDeadline) return { isEarlyBirdActive: false, earlyBirdDaysLeft: 0 };
  const deadline = earlyDeadline instanceof Date ? earlyDeadline : new Date(earlyDeadline);
  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return { isEarlyBirdActive: false, earlyBirdDaysLeft: 0 };
  return { isEarlyBirdActive: true, earlyBirdDaysLeft: Math.ceil(diffMs / MS_PER_DAY) };
}

export function remainingSeats(seats: number, enrolled: number): number {
  return Math.max(0, seats - enrolled);
}
