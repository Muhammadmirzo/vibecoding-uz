import { z } from "zod";

export const cronTriggerSchema = z.object({
  secret: z.string().optional(),
  action: z.enum(["all", "drip", "homework", "inactivity"]).default("all"),
});

export type CronTriggerInput = z.infer<typeof cronTriggerSchema>;

export const cronResultSchema = z.object({
  success: z.boolean(),
  timestamp: z.string(),
  dripUnlocksProcessed: z.number(),
  homeworkAlertsSent: z.number(),
  inactivityNudgesSent: z.number(),
  details: z
    .object({
      dripNotifications: z.array(z.string()),
      homeworkAlerts: z.array(z.string()),
      inactivityNudges: z.array(z.string()),
    })
    .optional(),
});

export type CronResult = z.infer<typeof cronResultSchema>;

/**
 * W4-ARCH-D: validated input for the cron reminder service. `action` selects
 * which reminder pipeline runs; the service computes its own timestamps.
 */
export const reminderRunSchema = z.object({
  action: z.enum(["all", "drip", "homework", "inactivity"]).default("all"),
});

export type ReminderRunInput = z.infer<typeof reminderRunSchema>;
