import { describe, expect, it, vi } from "vitest";
import { auditLogsQuerySchema } from "@/lib/validations/admin";
import { FALLBACK_RECIPIENT_COUNT, resolveAudience } from "@/features/crm/domain/notifications-policy";
import { createBroadcast, listBroadcasts } from "@/features/crm/server/notifications.service";
import type { BroadcastRow, NotificationsRepository } from "@/features/crm/server/notifications.repository";
import { getSettings, listAuditLogs, updateSettings } from "@/features/crm/server/admin.service";
import type { AdminRepository } from "@/features/crm/server/admin.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

function makeBroadcast(overrides: Partial<BroadcastRow> = {}): BroadcastRow {
  return {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    title: "Announcement",
    channel: "telegram",
    targetAudience: "all_users",
    cohortId: null,
    messageBody: "Hello students",
    status: "sent",
    recipientsCount: 10,
    sentAt: new Date("2026-01-01T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

const broadcastInput = {
  title: "Announcement",
  channel: "telegram" as const,
  targetAudience: "all_users" as const,
  messageBody: "Hello students",
  status: "sent" as const,
};

function notifRepo(overrides: Partial<NotificationsRepository> = {}): NotificationsRepository {
  const fake: NotificationsRepository = {
    listBroadcasts: async () => [],
    countUsers: async () => 42,
    countEnrollments: async () => 17,
    countEnrollmentsByCohort: async () => 8,
    countLeadsByStatus: async () => 5,
    createBroadcastTx: async (_ex, input, recipientCount) =>
      makeBroadcast({ title: input.title, recipientsCount: recipientCount }),
    recordAuditTx: async () => undefined,
    ...overrides,
  };
  return fake;
}

describe("broadcast audience policy", () => {
  it("resolves each audience to its counter kind", () => {
    expect(resolveAudience("all_users", null)).toEqual({ kind: "all_users" });
    expect(resolveAudience("cohort_students", "cohort-1")).toEqual({ kind: "cohort_students", cohortId: "cohort-1" });
    expect(resolveAudience("cohort_students", null)).toEqual({ kind: "fallback" });
    expect(resolveAudience("pending_homework", null)).toEqual({ kind: "fallback" });
    expect(FALLBACK_RECIPIENT_COUNT).toBe(15);
  });
});

describe("notifications service", () => {
  it("counts recipients per audience and audits creation", async () => {
    const audits: string[] = [];
    const repo = notifRepo({ recordAuditTx: async (_ex, input) => { audits.push(input.action); } });
    const all = await createBroadcast(repo, broadcastInput, { ip: "1.1.1.1" });
    expect(all.broadcast.recipientsCount).toBe(42);
    const cohort = await createBroadcast(
      repo,
      { ...broadcastInput, targetAudience: "cohort_students", cohortId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" },
      { ip: "1.1.1.1" },
    );
    expect(cohort.broadcast.recipientsCount).toBe(8);
    const fallback = await createBroadcast(repo, { ...broadcastInput, targetAudience: "pending_homework" }, { ip: "1.1.1.1" });
    expect(fallback.broadcast.recipientsCount).toBe(15);
    expect(audits).toEqual(["notification.broadcast", "notification.broadcast", "notification.broadcast"]);
  });

  it("lists broadcasts", async () => {
    const repo = notifRepo({ listBroadcasts: async () => [makeBroadcast()] });
    await expect(listBroadcasts(repo)).resolves.toHaveLength(1);
  });
});

describe("admin service (audit logs + settings)", () => {
  function adminRepo(overrides: Partial<AdminRepository> = {}): AdminRepository {
    const fake: AdminRepository = {
      listAuditLogs: async () => [],
      getAllSettings: async () => [],
      upsertSettingTx: async () => undefined,
      recordAuditTx: async () => undefined,
      ...overrides,
    };
    return fake;
  }

  it("passes the audit-log filter through and caps the limit", () => {
    const parsed = auditLogsQuerySchema.parse({ action: "user.create", limit: "50" });
    expect(parsed).toMatchObject({ action: "user.create", limit: 50 });
    expect(auditLogsQuerySchema.parse({})).toMatchObject({ action: "all", limit: 100 });
  });

  it("lists audit logs via the repository", async () => {
    const repo = adminRepo({
      listAuditLogs: async () => [
        {
          id: "log-1", userId: null, userEmail: null, action: "user.create",
          entityType: "user", entityId: "u-1", details: {}, ipAddress: "1.1.1.1",
          createdAt: new Date(), userName: null,
        },
      ],
    });
    const logs = await listAuditLogs(repo, { action: "all", search: undefined, limit: 100 });
    expect(logs).toHaveLength(1);
  });

  it("merges stored settings over defaults", async () => {
    const repo = adminRepo({ getAllSettings: async () => [{ key: "siteTitle", value: "Custom" }] });
    const settings = await getSettings(repo);
    expect(settings.siteTitle).toBe("Custom");
    expect(settings.supportPhone).toBe("+998 71 200 00 00");
  });

  it("upserts every key and audits the update", async () => {
    const upserted: string[] = [];
    const audits: string[] = [];
    const repo = adminRepo({
      upsertSettingTx: async (_ex, key) => { upserted.push(key); },
      recordAuditTx: async (_ex, input) => { audits.push(input.action); },
    });
    const data = {
      siteTitle: "Custom",
      supportPhone: "+998 71 200 00 00",
      supportTelegram: "@x",
      maintenanceMode: false,
      defaultCoursePrice: "1000.00",
      installmentRate3Months: 0,
      installmentRate6Months: 10,
      guaranteeRefundDays: 14,
      guaranteeTextUz: "Kafolat matni ancha uzun bo'lishi kerak",
      headerCtaText: "CTA",
      headerCtaLink: "/",
      enrollmentUrl: "/kabinet",
      telegramBotLink: "https://t.me/x",
      enableAnnouncementBanner: false,
      enableGamification: true,
      enableCommunityForum: true,
      enableInteractiveQuizzes: true,
      enableB2BEnterprise: true,
      enableCardReferrals: true,
      enableLevelGating: true,
      enableGuaranteeTrust: true,
    };
    const saved = await updateSettings(repo, data, { ip: "1.1.1.1" });
    expect(saved).toEqual(data);
    expect(upserted).toHaveLength(Object.keys(data).length);
    expect(audits).toEqual(["settings.update"]);
  });
});
