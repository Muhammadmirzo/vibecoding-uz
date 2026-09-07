import { NextResponse } from "next/server";
import { db } from "@/db";
import { cohorts, courses, enrollments } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { createCohortSchema } from "@/lib/validations";

export async function GET() {
  try {
    const rawCohorts = await db
      .select({
        cohort: cohorts,
        courseTitle: courses.title,
        courseSlug: courses.slug,
        enrolledCount: count(enrollments.id),
      })
      .from(cohorts)
      .leftJoin(courses, eq(cohorts.courseId, courses.id))
      .leftJoin(enrollments, eq(enrollments.cohortId, cohorts.id))
      .groupBy(cohorts.id, courses.id)
      .orderBy(desc(cohorts.startsAt));

    const now = new Date();

    const formattedCohorts = rawCohorts.map((item) => {
      const c = item.cohort;
      const enrolled = Number(item.enrolledCount || 0);
      const remainingSeats = Math.max(0, c.seats - enrolled);

      let isEarlyBirdActive = false;
      let earlyBirdDaysLeft = 0;

      if (c.earlyDeadline) {
        const deadlineDate = new Date(c.earlyDeadline);
        const diffMs = deadlineDate.getTime() - now.getTime();
        if (diffMs > 0) {
          isEarlyBirdActive = true;
          earlyBirdDaysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
      }

      return {
        id: c.id,
        courseId: c.courseId,
        courseTitle: item.courseTitle || "Noma'lum kurs",
        courseSlug: item.courseSlug || "",
        name: c.name,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        seats: c.seats,
        enrolledSeats: enrolled,
        remainingSeats,
        priceSum: c.priceSum,
        earlyPriceSum: c.earlyPriceSum,
        earlyDeadline: c.earlyDeadline,
        isEarlyBirdActive,
        earlyBirdDaysLeft,
        telegramChatId: c.telegramChatId,
        status: c.status,
      };
    });

    return NextResponse.json({
      success: true,
      cohorts: formattedCohorts,
    });
  } catch (error) {
    console.error("GET /api/admin/cohorts error:", error);
    return NextResponse.json(
      { error: "Guruhlarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = createCohortSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const [newCohort] = await db
      .insert(cohorts)
      .values({
        courseId: data.courseId,
        name: data.name,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        seats: data.seats,
        priceSum: data.priceSum,
        earlyPriceSum: data.earlyPriceSum || null,
        earlyDeadline: data.earlyDeadline ? new Date(data.earlyDeadline) : null,
        telegramChatId: data.telegramChatId || null,
        status: data.status,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        cohort: newCohort,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/cohorts error:", error);
    return NextResponse.json(
      { error: "Yangi guruh yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
