import { NextRequest, NextResponse } from "next/server";
import { cronResultSchema, reminderRunSchema } from "@/lib/validations/cron";
import { errorResponse } from "@/lib/http/errors";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { sendDripUnlockEmail } from "@/lib/email/resend";
import { sendSms } from "@/lib/sms/eskiz";
import { drizzleRemindersRepository } from "@/features/crm/server/reminders.repository";
import { runReminders, type ReminderNotifier } from "@/features/crm/server/reminders.service";
import { cleanupRateLimitBuckets } from "@/lib/security/rateLimit/postgresLimiter";
import { isCronAuthorized } from "@/lib/security/cron";
import { BRAND } from "@/config/brand";

const notifier: ReminderNotifier = {
  sendTelegram: async (tgUserId, html) => { await sendTelegramMessage(tgUserId, html); },
  sendDripEmail: async (input) => {
    await sendDripUnlockEmail({
      to: input.to,
      fullName: input.fullName,
      lessonTitle: input.lessonTitle,
      lessonUrl: `${BRAND.url}/kabinet`,
    });
  },
  sendSms: async (input) => { await sendSms({ phone: input.phone, message: input.message }); },
};

export async function GET(req: NextRequest) {
  return handleCronRequest(req);
}

export async function POST(req: NextRequest) {
  return handleCronRequest(req);
}

async function handleCronRequest(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat berilmagan (Unauthorized)" }, { status: 401 });
  }
  try {
    const actionParam = new URL(req.url).searchParams.get("action") || "all";
    const parsed = reminderRunSchema.safeParse({ action: actionParam });
    const input = parsed.success ? parsed.data : { action: "all" as const };
    const now = new Date();
    const outcome = await runReminders(drizzleRemindersRepository, notifier, input, now);
    // W10: shared rate-limit buckets cleanup — best-effort, never fails the cron run.
    await cleanupRateLimitBuckets();
    return NextResponse.json(cronResultSchema.parse({
      success: true,
      timestamp: now.toISOString(),
      dripUnlocksProcessed: outcome.dripUnlocksProcessed,
      homeworkAlertsSent: outcome.homeworkAlertsSent,
      inactivityNudgesSent: outcome.inactivityNudgesSent,
      details: outcome.details,
    }));
  } catch (err) {
    return errorResponse(err);
  }
}
