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
