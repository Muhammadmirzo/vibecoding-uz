import { NextResponse } from "next/server";
import { QUIZ_QUESTIONS } from "@/features/quiz/quizData";
import { drizzleQuizRepository, QuizError, submitQuizLead } from "@/features/quiz/server/quiz.service";
import { freeLessonLeadSchema, quizLeadSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { db } from "@/db";
import { leads } from "@/db/schema";

function normalizeContact(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("@")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("998")) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return digits ? `+${digits}` : trimmed;
}

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
    const normalizedPhone = normalizeContact(rawBody.phone);
    const normalizedTelegram = typeof rawBody.telegram === "string"
      ? rawBody.telegram.trim()
      : source === "free_lesson" && normalizedPhone.startsWith("@") ? normalizedPhone : "";

    if (source === "free_lesson") {
      const parseResult = freeLessonLeadSchema.safeParse({
        ...rawBody, name: normalizedName,
        phone: normalizedPhone || undefined, telegram: normalizedTelegram || undefined, source,
      });
      if (!parseResult.success) {
        return NextResponse.json({ error: "Ma'lumotlar noto'g'ri kiritildi", details: parseResult.error.flatten() }, { status: 400 });
      }
      const data = parseResult.data;
      const [newLead] = await db.insert(leads).values({
        name: data.name,
        phone: data.phone || null,
        telegram: data.telegram || null,
        source: data.source,
        status: data.status,
        recommendedCourseId: data.recommendedCourseId || null,
        quizAnswers: data.quizAnswers || null,
        utm: data.utm || null,
      }).returning();
      return NextResponse.json({ success: true, message: "So'rov saqlandi", lead: newLead }, { status: 201 });
    }

    // Quiz path: contact validated by Zod, answers validated against the
    // question bank, score + recommendation recomputed server-side.
    const contact = quizLeadSchema.safeParse({ ...rawBody, name: normalizedName, phone: normalizedPhone, source });
    if (!contact.success) {
      return NextResponse.json({ error: "Ma'lumotlar noto'g'ri kiritildi", details: contact.error.flatten() }, { status: 400 });
    }
    try {
      const { leadId, result } = await submitQuizLead(drizzleQuizRepository, {
        name: contact.data.name,
        phone: contact.data.phone,
        quizAnswers: contact.data.quizAnswers ?? rawBody.quizAnswers,
        utm: contact.data.utm,
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
      if (error instanceof QuizError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("POST /api/quiz error:", error);
    return NextResponse.json({ error: "Quiz ma'lumotlarini saqlashda xatolik yuz berdi" }, { status: 500 });
  }
}
