import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  homeworkSubmissions,
  homeworkAssignments,
  homeworkReviews,
  lessons,
  users,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || "all";

    const submissionsQuery = db
      .select({
        id: homeworkSubmissions.id,
        assignmentId: homeworkSubmissions.assignmentId,
        assignmentTitle: homeworkAssignments.title,
        assignmentDescription: homeworkAssignments.descriptionMd,
        acceptanceCriteria: homeworkAssignments.acceptanceCriteria,
        lessonId: homeworkAssignments.lessonId,
        lessonTitle: lessons.title,
        studentId: homeworkSubmissions.userId,
        studentName: users.fullName,
        studentPhone: users.phone,
        studentAvatar: users.avatarUrl,
        attemptNo: homeworkSubmissions.attemptNo,
        payload: homeworkSubmissions.payload,
        status: homeworkSubmissions.status,
        submittedAt: homeworkSubmissions.submittedAt,
        review: {
          id: homeworkReviews.id,
          score: homeworkReviews.score,
          feedbackMd: homeworkReviews.feedbackMd,
          criteriaResults: homeworkReviews.criteriaResults,
          reviewedAt: homeworkReviews.reviewedAt,
        },
      })
      .from(homeworkSubmissions)
      .leftJoin(homeworkAssignments, eq(homeworkSubmissions.assignmentId, homeworkAssignments.id))
      .leftJoin(lessons, eq(homeworkAssignments.lessonId, lessons.id))
      .leftJoin(users, eq(homeworkSubmissions.userId, users.id))
      .leftJoin(homeworkReviews, eq(homeworkReviews.submissionId, homeworkSubmissions.id))
      .orderBy(desc(homeworkSubmissions.submittedAt));

    const rawSubmissions = await submissionsQuery;

    let filtered = rawSubmissions;
    if (statusParam !== "all") {
      filtered = rawSubmissions.filter((sub) => sub.status === statusParam);
    }

    return NextResponse.json({
      success: true,
      submissions: filtered,
    });
  } catch (error) {
    console.error("GET /api/admin/homework error:", error);
    return NextResponse.json(
      { error: "Topshiriqlarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
