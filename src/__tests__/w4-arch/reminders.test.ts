import { describe, expect, it } from "vitest";
import {
  findRecentDripUnlocks, resolveUnlockDate, runReminders, wasUnlockedRecently,
  type ReminderNotifier,
} from "@/features/crm/server/reminders.service";
import type { DripEnrollment, RemindersRepository } from "@/features/crm/server/reminders.repository";

const NOW = new Date("2026-09-24T12:00:00.000Z");

const ENROLLMENT: DripEnrollment = {
  userEmail: "ali@example.com", userFullName: "Ali Valiyev",
  tgUserId: "111", cohortStartsAt: new Date("2026-09-01T00:00:00Z"), courseId: "course-1",
};

function repo(): RemindersRepository {
  return {
    findActiveDripEnrollments: async () => [ENROLLMENT],
    findDateLessons: async () => [
      { title: "Recent", dripValue: "2026-09-24T06:00:00.000Z" },
      { title: "Old", dripValue: "2026-09-10T00:00:00.000Z" },
      { title: "Future", dripValue: "2026-09-30T00:00:00.000Z" },
    ],
    findHomeworkAssignments: async () => [
      { assignmentId: "a-1", assignmentTitle: "Vazifa 1", courseId: "course-1" },
    ],
    findActiveStudents: async () => [
      { userId: "u-done", fullName: "Done Student", tgUserId: "222" },
      { userId: "u-todo", fullName: "Todo Student", tgUserId: "333" },
    ],
    findSubmittedUserIds: async () => ["u-done"],
    findInactiveUsers: async () => [
      { fullName: "Quiet One", phone: null, tgUserId: "444", lastLoginAt: null },
      { fullName: "Sms One", phone: "+998909999999", tgUserId: null, lastLoginAt: new Date("2026-01-01T00:00:00Z") },
    ],
  };
}

function notifier(sent: { telegram: string[]; email: string[]; sms: string[] }): ReminderNotifier {
  return {
    sendTelegram: async (id) => { sent.telegram.push(id); },
    sendDripEmail: async (input) => { sent.email.push(input.to); },
    sendSms: async (input) => { sent.sms.push(input.phone); },
  };
}

describe("drip-unlock builders", () => {
  it("resolves ISO dates directly and day-offsets from cohort start", () => {
    expect(resolveUnlockDate("2026-09-24T06:00:00.000Z", null)?.toISOString()).toBe("2026-09-24T06:00:00.000Z");
    expect(resolveUnlockDate(null, ENROLLMENT.cohortStartsAt)).toBe(null);
    expect(resolveUnlockDate("not-a-date", null)).toBe(null);
  });
  it("treats only the last 24h as recent", () => {
    expect(wasUnlockedRecently(new Date("2026-09-24T06:00:00Z"), NOW)).toBe(true);
    expect(wasUnlockedRecently(new Date("2026-09-10T00:00:00Z"), NOW)).toBe(false);
    expect(wasUnlockedRecently(new Date("2026-09-30T00:00:00Z"), NOW)).toBe(false);
  });
  it("picks only recently unlocked lessons", () => {
    const picked = findRecentDripUnlocks(ENROLLMENT, [
      { title: "Recent", dripValue: "2026-09-24T06:00:00.000Z" },
      { title: "Old", dripValue: "2026-09-10T00:00:00.000Z" },
    ], NOW);
    expect(picked.map((l) => l.title)).toEqual(["Recent"]);
  });
});

describe("runReminders service", () => {
  it("runs all pipelines and skips submitted students via bulk lookup", async () => {
    const sent = { telegram: [] as string[], email: [] as string[], sms: [] as string[] };
    const out = await runReminders(repo(), notifier(sent), { action: "all" }, NOW);
    expect(out.dripUnlocksProcessed).toBe(1);
    expect(out.homeworkAlertsSent).toBe(1);
    expect(out.inactivityNudgesSent).toBe(2);
    expect(out.details.dripNotifications).toEqual(["Ali Valiyev -> Recent"]);
    expect(out.details.homeworkAlerts).toEqual(["Todo Student -> Vazifa 1"]);
    expect(sent.telegram.sort()).toEqual(["111", "333", "444"]);
    expect(sent.email).toEqual(["ali@example.com"]);
    expect(sent.sms).toEqual(["+998909999999"]);
  });
  it("runs a single pipeline when action is selective", async () => {
    const sent = { telegram: [] as string[], email: [] as string[], sms: [] as string[] };
    const out = await runReminders(repo(), notifier(sent), { action: "drip" }, NOW);
    expect(out.dripUnlocksProcessed).toBe(1);
    expect(out.homeworkAlertsSent).toBe(0);
    expect(out.inactivityNudgesSent).toBe(0);
    expect(sent.sms).toEqual([]);
  });
});
