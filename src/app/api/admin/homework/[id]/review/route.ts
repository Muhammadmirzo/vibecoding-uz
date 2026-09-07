import { NextResponse } from "next/server";
import { db } from "@/db";
import { homeworkSubmissions, homeworkReviews, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { gradeHomeworkSchema } from "@/lib/validations";
import { getAuthSession } from "@/lib/auth/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = gradeHomeworkSchema.safeParse({
      ...body,
      submissionId: id,
    });

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

    // Get auth session or fallback to first mentor/admin if needed
    const authSession = await getAuthSession();
    let mentorId = data.mentorId || authSession?.userId;

    if (!mentorId) {
      // Pick first admin/mentor user from DB if not provided
      const [adminUser] = await db
        .select({ id: users.id })
        .from(users)
        .limit(1);
      mentorId = adminUser?.id;
    }

    if (!mentorId) {
      return NextResponse.json(
        { error: "Mentor topilmadi" },
        { status: 400 }
      );
    }

    // 1. Update homework_submissions status
    const [updatedSubmission] = await db
      .update(homeworkSubmissions)
      .set({
        status: data.status,
      })
      .where(eq(homeworkSubmissions.id, id))
      .returning();

    if (!updatedSubmission) {
      return NextResponse.json(
        { error: "Topshiriq topilmadi" },
        { status: 404 }
      );
    }

    // 2. Upsert homework_reviews record
    const existingReviews = await db
      .select()
      .from(homeworkReviews)
      .where(eq(homeworkReviews.submissionId, id));

    let reviewResult;
    if (existingReviews.length > 0) {
      [reviewResult] = await db
        .update(homeworkReviews)
        .set({
          mentorId,
          criteriaResults: data.criteriaResults,
          score: data.score.toFixed(2),
          feedbackMd: data.feedbackMd || "",
          reviewedAt: new Date(),
        })
        .where(eq(homeworkReviews.submissionId, id))
        .returning();
    } else {
      [reviewResult] = await db
        .insert(homeworkReviews)
        .values({
          submissionId: id,
          mentorId,
          criteriaResults: data.criteriaResults,
          score: data.score.toFixed(2),
          feedbackMd: data.feedbackMd || "",
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      review: reviewResult,
    });
  } catch (error) {
    console.error("POST /api/admin/homework/[id]/review error:", error);
    return NextResponse.json(
      { error: "Topshiriqni baholashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
