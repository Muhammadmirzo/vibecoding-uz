import { NextRequest, NextResponse } from "next/server";
import { eq, and, lte, isNull, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  enrollments,
  cohorts,
  lessons,
  homeworkAssignments,
  homeworkSubmissions,
  courseSections,
} from "@/db/schema";
import { cronTriggerSchema, cronResultSchema, CronResult } from "@/lib/validations/cron";
import { sendTelegramMessage, sendHomeworkSubmissionAlert } from "@/lib/telegram/bot";
import { sendDripUnlockEmail } from "@/lib/email/resend";
import { sendSms } from "@/lib/sms/eskiz";

export async function GET(req: NextRequest) {
  return handleCronRequest(req);
}

export async function POST(req: NextRequest) {
  return handleCronRequest(req);
}

async function handleCronRequest(req: NextRequest) {
  // 1. Verify Secret Authorization if CRON_SECRET is configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    const secretHeader = req.headers.get("x-cron-secret");
    const token = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : secretHeader;

    if (token !== cronSecret) {
      return NextResponse.json({ error: "Ruxsat berilmagan (Unauthorized)" }, { status: 401 });
    }
  }

  // 2. Parse query or body action
  const url = new URL(req.url);
  const actionParam = url.searchParams.get("action") || "all";
  const parsedTrigger = cronTriggerSchema.safeParse({ action: actionParam });
  const action = parsedTrigger.success ? parsedTrigger.data.action : "all";

  const now = new Date();
  const dripNotifications: string[] = [];
  const homeworkAlerts: string[] = [];
  const inactivityNudges: string[] = [];

  try {
    // ----------------------------------------------------
    // Routine 1: Drip Unlocks Processing
    // ----------------------------------------------------
    if (action === "all" || action === "drip") {
      // Find active enrollments and associated scheduled lessons
      const activeEnrollments = await db
        .select({
          userId: enrollments.userId,
          userEmail: users.email,
          userPhone: users.phone,
          userFullName: users.fullName,
          tgUserId: users.tgUserId,
          cohortStartsAt: cohorts.startsAt,
          courseId: cohorts.courseId,
        })
        .from(enrollments)
        .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
        .innerJoin(users, eq(enrollments.userId, users.id))
        .where(eq(enrollments.status, "active"));

      for (const item of activeEnrollments) {
        // Query lessons for course with date drip rules
        const dateLessons = await db
          .select({
            id: lessons.id,
            title: lessons.title,
            slug: lessons.slug,
            dripValue: lessons.dripValue,
          })
          .from(lessons)
          .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
          .where(
            and(
              eq(courseSections.courseId, item.courseId),
              eq(lessons.dripRule, "date")
            )
          );

        for (const lesson of dateLessons) {
          if (!lesson.dripValue) continue;

          let unlockDate: Date | null = null;
          const parsed = new Date(lesson.dripValue);
          if (!isNaN(parsed.getTime())) {
            unlockDate = parsed;
          } else {
            const days = parseInt(lesson.dripValue.replace(/[^\d]/g, ""), 10);
            if (!isNaN(days) && item.cohortStartsAt) {
              unlockDate = new Date(new Date(item.cohortStartsAt).getTime() + days * 86400000);
            }
          }

          // Check if lesson unlocked within the last 24 hours
          if (unlockDate) {
            const timeDiff = now.getTime() - unlockDate.getTime();
            if (timeDiff >= 0 && timeDiff <= 24 * 3600 * 1000) {
              const msgText = `🚀 Yangi dars ochildi: "${lesson.title}"`;
              dripNotifications.push(`${item.userFullName} -> ${lesson.title}`);

              if (item.tgUserId) {
                await sendTelegramMessage(
                  item.tgUserId,
                  `<b>YANGI DARS OCHILDI!</b> 🚀\n\n📚 <b>Dars:</b> ${lesson.title}\n\nKabinetga kirib darsni ko'rishingiz mumkin!`
                );
              }

              if (item.userEmail) {
                await sendDripUnlockEmail({
                  to: item.userEmail,
                  fullName: item.userFullName,
                  lessonTitle: lesson.title,
                  lessonUrl: `https://vibecoding.uz/kabinet`,
                });
              }
            }
          }
        }
      }
    }

    // ----------------------------------------------------
    // Routine 2: Homework Deadline Alerts
    // ----------------------------------------------------
    if (action === "all" || action === "homework") {
      // Find active students who haven't submitted pending homework assignments
      const pendingAssignments = await db
        .select({
          assignmentId: homeworkAssignments.id,
          assignmentTitle: homeworkAssignments.title,
          lessonId: homeworkAssignments.lessonId,
          courseId: courseSections.courseId,
        })
        .from(homeworkAssignments)
        .innerJoin(lessons, eq(homeworkAssignments.lessonId, lessons.id))
        .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id));

      for (const assign of pendingAssignments) {
        const activeStudents = await db
          .select({
            userId: users.id,
            fullName: users.fullName,
            phone: users.phone,
            tgUserId: users.tgUserId,
          })
          .from(enrollments)
          .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
          .innerJoin(users, eq(enrollments.userId, users.id))
          .where(
            and(
              eq(cohorts.courseId, assign.courseId),
              eq(enrollments.status, "active")
            )
          );

        for (const student of activeStudents) {
          const subs = await db
            .select()
            .from(homeworkSubmissions)
            .where(
              and(
                eq(homeworkSubmissions.assignmentId, assign.assignmentId),
                eq(homeworkSubmissions.userId, student.userId)
              )
            )
            .limit(1);

          if (subs.length === 0) {
            // Student has not submitted this homework
            homeworkAlerts.push(`${student.fullName} -> ${assign.assignmentTitle}`);

            if (student.tgUserId) {
              await sendTelegramMessage(
                student.tgUserId,
                `⏰ <b>TOPSHIRIQ ESLATMASI</b>\n\n📌 <b>Mavzu:</b> "${assign.assignmentTitle}"\n\nTopshiriqni o'z vaqtida bajarib yuborishni unutmang!`
              );
            }
          }
        }
      }
    }

    // ----------------------------------------------------
    // Routine 3: Inactivity Nudges
    // ----------------------------------------------------
    if (action === "all" || action === "inactivity") {
      // Find students who haven't logged in for over 3 days (3 * 86400 * 1000 ms)
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);

      const inactiveUsers = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          tgUserId: users.tgUserId,
          lastLoginAt: users.lastLoginAt,
        })
        .from(users)
        .where(
          and(
            eq(users.role, "student"),
            sql`${users.lastLoginAt} < ${threeDaysAgo} OR ${users.lastLoginAt} IS NULL`
          )
        )
        .limit(50);

      for (const u of inactiveUsers) {
        inactivityNudges.push(u.fullName);

        const nudgeMessage = `Salom ${u.fullName}! Mirzo Academy platformasida darslaringiz kutmoqda. Bilimingizni oshirishda davom eting! 🚀 https://vibecoding.uz/kabinet`;

        if (u.tgUserId) {
          await sendTelegramMessage(
            u.tgUserId,
            `👋 <b>Sizni sog'indik, ${u.fullName}!</b>\n\nMirzo Academy platformasidagi darslaringiz sizni kutmoqda. Bilim olishda to'xtab qolmang! 🚀`
          );
        } else if (u.phone) {
          await sendSms({
            phone: u.phone,
            message: nudgeMessage,
          });
        }
      }
    }

    const responseData: CronResult = {
      success: true,
      timestamp: now.toISOString(),
      dripUnlocksProcessed: dripNotifications.length,
      homeworkAlertsSent: homeworkAlerts.length,
      inactivityNudgesSent: inactivityNudges.length,
      details: {
        dripNotifications,
        homeworkAlerts,
        inactivityNudges,
      },
    };

    const validated = cronResultSchema.parse(responseData);
    return NextResponse.json(validated);
  } catch (err) {
    console.error("Cron reminders execution failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: String(err),
        timestamp: now.toISOString(),
      },
      { status: 500 }
    );
  }
}
