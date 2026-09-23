import { NextRequest, NextResponse } from "next/server";
import { cronTriggerSchema, cronResultSchema, CronResult } from "@/lib/validations/cron";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { sendDripUnlockEmail } from "@/lib/email/resend";
import { sendSms } from "@/lib/sms/eskiz";
import { findRecentDripUnlocks } from "../reminderBuilders";
import {
  findActiveDripEnrollments,
  findActiveStudents,
  findDateLessons,
  findHomeworkAssignments,
  findInactiveUsers,
  hasHomeworkSubmission,
} from "../reminderQueries";
import type { ReminderDetails } from "../reminderTypes";

export async function GET(req: NextRequest) {
  return handleCronRequest(req);
}

export async function POST(req: NextRequest) {
  return handleCronRequest(req);
}

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const authHeader = req.headers.get("authorization");
  const secretHeader = req.headers.get("x-cron-secret");
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : secretHeader;
  return token === cronSecret;
}

async function processDripReminders(now: Date, details: ReminderDetails): Promise<void> {
  const enrollments = await findActiveDripEnrollments();
  for (const enrollment of enrollments) {
    const lessons = await findDateLessons(enrollment.courseId);
    for (const lesson of findRecentDripUnlocks(enrollment, lessons, now)) {
      details.dripNotifications.push(`${enrollment.userFullName} -> ${lesson.title}`);
      if (enrollment.tgUserId) {
        await sendTelegramMessage(
          enrollment.tgUserId,
          `<b>YANGI DARS OCHILDI!</b> 🚀\n\n📚 <b>Dars:</b> ${lesson.title}\n\nKabinetga kirib darsni ko'rishingiz mumkin!`,
        );
      }
      if (enrollment.userEmail) {
        await sendDripUnlockEmail({
          to: enrollment.userEmail,
          fullName: enrollment.userFullName,
          lessonTitle: lesson.title,
          lessonUrl: "https://vibecoding.uz/kabinet",
        });
      }
    }
  }
}

async function processHomeworkReminders(details: ReminderDetails): Promise<void> {
  const assignments = await findHomeworkAssignments();
  for (const assignment of assignments) {
    const students = await findActiveStudents(assignment.courseId);
    for (const student of students) {
      const submitted = await hasHomeworkSubmission(assignment.assignmentId, student.userId);
      if (!submitted) {
        details.homeworkAlerts.push(`${student.fullName} -> ${assignment.assignmentTitle}`);
        if (student.tgUserId) {
          await sendTelegramMessage(
            student.tgUserId,
            `⏰ <b>TOPSHIRIQ ESLATMASI</b>\n\n📌 <b>Mavzu:</b> "${assignment.assignmentTitle}"\n\nTopshiriqni o'z vaqtida bajarib yuborishni unutmang!`,
          );
        }
      }
    }
  }
}

async function processInactivityReminders(now: Date, details: ReminderDetails): Promise<void> {
  const threshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const users = await findInactiveUsers(threshold);
  for (const user of users) {
    details.inactivityNudges.push(user.fullName);
    const nudgeMessage = `Salom ${user.fullName}! Mirzo Academy platformasida darslaringiz kutmoqda. Bilimingizni oshirishda davom eting! 🚀 https://vibecoding.uz/kabinet`;
    if (user.tgUserId) {
      await sendTelegramMessage(
        user.tgUserId,
        `👋 <b>Sizni sog'indik, ${user.fullName}!</b>\n\nMirzo Academy platformasidagi darslaringiz sizni kutmoqda. Bilim olishda to'xtab qolmang! 🚀`,
      );
    } else if (user.phone) {
      await sendSms({ phone: user.phone, message: nudgeMessage });
    }
  }
}

async function handleCronRequest(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Ruxsat berilmagan (Unauthorized)" }, { status: 401 });
  }

  const actionParam = new URL(req.url).searchParams.get("action") || "all";
  const parsedTrigger = cronTriggerSchema.safeParse({ action: actionParam });
  const action = parsedTrigger.success ? parsedTrigger.data.action : "all";
  const now = new Date();
  const details: ReminderDetails = { dripNotifications: [], homeworkAlerts: [], inactivityNudges: [] };

  try {
    if (action === "all" || action === "drip") await processDripReminders(now, details);
    if (action === "all" || action === "homework") await processHomeworkReminders(details);
    if (action === "all" || action === "inactivity") await processInactivityReminders(now, details);

    const responseData: CronResult = {
      success: true,
      timestamp: now.toISOString(),
      dripUnlocksProcessed: details.dripNotifications.length,
      homeworkAlertsSent: details.homeworkAlerts.length,
      inactivityNudgesSent: details.inactivityNudges.length,
      details,
    };
    return NextResponse.json(cronResultSchema.parse(responseData));
  } catch (err) {
    console.error("Cron reminders execution failed:", err);
    return NextResponse.json(
      { success: false, error: String(err), timestamp: now.toISOString() },
      { status: 500 },
    );
  }
}
