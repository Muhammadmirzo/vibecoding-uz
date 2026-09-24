import { withTransactionLock } from "@/db";
import { ServiceError } from "@/lib/http/errors";
import type { AuditLogsQuery, SiteSettingsInput } from "@/lib/validations/admin";
import type { AdminRepository, AuditLogItem, DbExecutor } from "./admin.repository";

/**
 * Admin read-only concerns (audit logs) plus site-settings management.
 * Settings defaults live here so the route stays thin.
 */

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  siteTitle: "Naqsh",
  supportPhone: "+998 71 200 00 00",
  supportTelegram: "@mirzo_academy_support_bot",
  maintenanceMode: false,
  defaultCoursePrice: "2990000.00",
  installmentRate3Months: 0,
  installmentRate6Months: 10,
  guaranteeRefundDays: 14,
  guaranteeTextUz: "14 kun davomida o'quv dasturi ma'qul kelmasa, to'lov 100% holatda hech qanday savollarsiz qaytarib beriladi.",
  paymeMerchantId: "",
  paymeSecretKey: "",
  clickServiceId: "",
  clickSecretKey: "",
  telegramBotToken: "",
  smsApiKey: "",
  headerCtaText: "Kurs tanlash",
  headerCtaLink: "/#kurs-tanlash",
  enrollmentUrl: "/kabinet",
  telegramBotLink: "https://t.me/m/ODAfK_QIMjky",
  announcementBannerText: "Yangi Vibe Coding Express guruhiga qabul boshlandi! Mashg'ulotlar tez orada start oladi.",
  announcementBannerLink: "/kurs/vibe-coding-express",
  enableAnnouncementBanner: true,
  enableGamification: true,
  enableCommunityForum: true,
  enableInteractiveQuizzes: true,
  enableB2BEnterprise: true,
  enableCardReferrals: true,
  enableLevelGating: true,
  enableGuaranteeTrust: true,
};

export async function listAuditLogs(repo: AdminRepository, query: AuditLogsQuery): Promise<AuditLogItem[]> {
  return repo.listAuditLogs({ action: query.action, search: query.search, limit: query.limit });
}

export async function getSettings(repo: AdminRepository): Promise<Record<string, unknown>> {
  const rows = await repo.getAllSettings();
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of rows) merged[row.key] = row.value;
  return merged;
}

export async function updateSettings(
  repo: AdminRepository,
  data: SiteSettingsInput,
  opts: { ip: string },
): Promise<SiteSettingsInput> {
  const keys = Object.keys(data);
  return withTransactionLock(`settings:${Date.now()}`, async (tx) => {
    const ex = tx as DbExecutor;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Baza tranzaksiyasi mavjud emas", 503);
    for (const [key, value] of Object.entries(data)) {
      await repo.upsertSettingTx(ex, key, value);
    }
    await repo.recordAuditTx(ex, {
      action: "settings.update",
      entityType: "site_settings",
      details: { updatedKeys: keys },
      ip: opts.ip,
    });
    return data;
  });
}
