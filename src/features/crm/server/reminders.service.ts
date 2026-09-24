import type { ReminderRunInput } from "@/lib/validations/cron";
import type {
  DripEnrollment, DripLesson, ReminderDetails, RemindersRepository,
} from "./reminders.repository";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const INACTIVITY_DAYS = 3;

/** Pure drip-unlock math (moved from app/api/cron/reminderBuilders.ts). */
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

export interface ReminderNotifier {
  sendTelegram(tgUserId: string, html: string): Promise<void>;
  sendDripEmail(input: { to: string; fullName: string; lessonTitle: string }): Promise<void>;
  sendSms(input: { phone: string; message: string }): Promise<void>;
}

export interface ReminderOutcome {
  dripUnlocksProcessed: number;
  homeworkAlertsSent: number;
  inactivityNudgesSent: number;
  details: ReminderDetails;
}

async function processDrip(
  repo: RemindersRepository, notifier: ReminderNotifier, now: Date, details: ReminderDetails,
): Promise<void> {
  const enrollments = await repo.findActiveDripEnrollments();
  for (const enrollment of enrollments) {
    const lessons = await repo.findDateLessons(enrollment.courseId);
    for (const lesson of findRecentDripUnlocks(enrollment, lessons, now)) {
      details.dripNotifications.push(`${enrollment.userFullName} -> ${lesson.title}`);
      if (enrollment.tgUserId) {
        await notifier.sendTelegram(
          enrollment.tgUserId,
          `<b>YANGI DARS OCHILDI!</b> 🚀\n\n📚 <b>Dars:</b> ${lesson.title}\n\nKabinetga kirib darsni ko'rishingiz mumkin!`,
        );
      }
      if (enrollment.userEmail) {
        await notifier.sendDripEmail({ to: enrollment.userEmail, fullName: enrollment.userFullName, lessonTitle: lesson.title });
      }
    }
  }
}

async function processHomework(
  repo: RemindersRepository, notifier: ReminderNotifier, details: ReminderDetails,
): Promise<void> {
  const assignments = await repo.findHomeworkAssignments();
  for (const assignment of assignments) {
    const students = await repo.findActiveStudents(assignment.courseId);
    if (students.length === 0) continue;
    const submitted = new Set(await repo.findSubmittedUserIds(assignment.assignmentId));
    for (const student of students) {
      if (submitted.has(student.userId)) continue;
      details.homeworkAlerts.push(`${student.fullName} -> ${assignment.assignmentTitle}`);
      if (student.tgUserId) {
        await notifier.sendTelegram(
          student.tgUserId,
          `⏰ <b>TOPSHIRIQ ESLATMASI</b>\n\n📌 <b>Mavzu:</b> "${assignment.assignmentTitle}"\n\nTopshiriqni o'z vaqtida bajarib yuborishni unutmang!`,
        );
      }
    }
  }
}

async function processInactivity(
  repo: RemindersRepository, notifier: ReminderNotifier, now: Date, details: ReminderDetails,
): Promise<void> {
  const threshold = new Date(now.getTime() - INACTIVITY_DAYS * DAY_MS);
  const users = await repo.findInactiveUsers(threshold);
  for (const user of users) {
    details.inactivityNudges.push(user.fullName);
    const nudgeMessage = `Salom ${user.fullName}! Mirzo Academy platformasida darslaringiz kutmoqda. Bilimingizni oshirishda davom eting! 🚀 https://vibecoding.uz/kabinet`;
    if (user.tgUserId) {
      await notifier.sendTelegram(
        user.tgUserId,
        `👋 <b>Sizni sog'indik, ${user.fullName}!</b>\n\nMirzo Academy platformasidagi darslaringiz sizni kutmoqda. Bilim olishda to'xtab qolmang! 🚀`,
      );
    } else if (user.phone) {
      await notifier.sendSms({ phone: user.phone, message: nudgeMessage });
    }
  }
}

/** Runs the selected reminder pipelines with Zod-validated input. */
export async function runReminders(
  repo: RemindersRepository,
  notifier: ReminderNotifier,
  input: ReminderRunInput,
  now: Date = new Date(),
): Promise<ReminderOutcome> {
  const details: ReminderDetails = { dripNotifications: [], homeworkAlerts: [], inactivityNudges: [] };
  if (input.action === "all" || input.action === "drip") await processDrip(repo, notifier, now, details);
  if (input.action === "all" || input.action === "homework") await processHomework(repo, notifier, details);
  if (input.action === "all" || input.action === "inactivity") await processInactivity(repo, notifier, now, details);
  return {
    dripUnlocksProcessed: details.dripNotifications.length,
    homeworkAlertsSent: details.homeworkAlerts.length,
    inactivityNudgesSent: details.inactivityNudges.length,
    details,
  };
}
