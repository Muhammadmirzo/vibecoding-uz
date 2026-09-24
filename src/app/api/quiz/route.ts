import { NextResponse } from "next/server";
import { QUIZ_QUESTIONS } from "@/features/quiz/quizData";
import {
  drizzleQuizRepository,
  normalizeQuizContact,
  submitFreeLessonLead,
  submitQuizLead,
} from "@/features/quiz/server/quiz.service";
import { freeLessonLeadSchema, quizLeadSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { errorResponse } from "@/lib/http/errors";

export async function GET() {
  return NextResponse.json(
    { success: true, questions: QUIZ_QUESTIONS },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rlResult = await checkRateLimit(ip, PRESETS.QUIZ);
    if (!rlResult.success) return createRateLimitResponse(rlResult);

    const body = await request.json();
    const rawBody: Record<string, unknown> =
      typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

    const source = rawBody.source === "free_lesson" ? "free_lesson" : "quiz";
    const normalizedName = typeof rawBody.name === "string" ? rawBody.name.trim() : "";
    const normalizedPhone = normalizeQuizContact(rawBody.phone);
    const normalizedTelegram = typeof rawBody.telegram === "string"
      ? rawBody.telegram.trim()
      : source === "free_lesson" && normalizedPhone.startsWith("@") ? normalizedPhone : "";

    if (source === "free_lesson") {
      const data = freeLessonLeadSchema.parse({
        ...rawBody,
        name: normalizedName,
        phone: normalizedPhone || undefined,
        telegram: normalizedTelegram || undefined,
        source,
      });
      const { leadId } = await submitFreeLessonLead(drizzleQuizRepository, {
        name: data.name,
        phone: data.phone,
        telegram: data.telegram,
        status: data.status,
        recommendedCourseId: data.recommendedCourseId,
        quizAnswers: data.quizAnswers,
        utm: data.utm,
      });
      return NextResponse.json({ success: true, message: "So'rov saqlandi", leadId }, { status: 201 });
    }

    // Quiz path: contact validated by Zod, answers validated against the
    // question bank, score + recommendation recomputed server-side.
    const contact = quizLeadSchema.parse({ ...rawBody, name: normalizedName, phone: normalizedPhone, source });
    const { leadId, result } = await submitQuizLead(drizzleQuizRepository, {
      name: contact.name,
      phone: contact.phone,
      quizAnswers: contact.quizAnswers ?? rawBody.quizAnswers,
      utm: contact.utm,
      recommendedCourseId: typeof rawBody.recommendedCourseId === "string" ? rawBody.recommendedCourseId : null,
    });
    return NextResponse.json(
      {
        success: true,
        message: "Quiz natijasi saqlandi",
        leadId,
        scores: result.scores,
        recommendedCourse: result.recommendedCourse,
        reasoning: result.reasoning,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
