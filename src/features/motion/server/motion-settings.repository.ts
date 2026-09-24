import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, siteSettings } from "@/db/schema";
import type { MotionSettings } from "../domain/settings";

export type MotionDbExecutor = Pick<typeof db, "select" | "update" | "insert">;

export const motionSettingsRepository = {
  async read(): Promise<unknown> {
    const rows = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "motion")).limit(1);
    return rows[0]?.value;
  },

  async write(settings: MotionSettings, audit: { userId: string; ip: string }): Promise<void> {
    await db.transaction(async (tx) => {
      await this.writeTx(tx, settings, audit);
    });
  },

  async writeTx(
    ex: MotionDbExecutor,
    settings: MotionSettings,
    audit: { userId: string; ip: string },
  ): Promise<void> {
    const existing = await ex.select({ id: siteSettings.id }).from(siteSettings).where(eq(siteSettings.key, "motion")).limit(1);
    if (existing[0]) {
      await ex.update(siteSettings).set({ value: settings, updatedAt: new Date() }).where(eq(siteSettings.key, "motion"));
    } else {
      await ex.insert(siteSettings).values({ key: "motion", value: settings, updatedAt: new Date() });
    }
    await ex.insert(auditLogs).values({
      userId: audit.userId,
      action: "motion.settings.update",
      entityType: "site_settings",
      entityId: "motion",
      details: { settings },
      ipAddress: audit.ip,
    });
  },
};
