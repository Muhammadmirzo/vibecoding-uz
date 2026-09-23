import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { freeLessonLeadSchema, quizLeadSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { QUIZ_QUESTIONS } from "@/features/quiz/quizData";

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
    {
      success: true,
      questions: QUIZ_QUESTIONS,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rlResult = await checkRateLimit(ip, PRESETS.QUIZ);
    if (!rlResult.success) {
      return createRateLimitResponse(rlResult);
    }

    const body = await request.json();
    const rawBody: Record<string, unknown> =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};

    const source = rawBody.source === "free_lesson" ? "free_lesson" : "quiz";
    const normalizedName = typeof rawBody.name === "string" ? rawBody.name.trim() : "";
    const normalizedPhone = normalizeContact(rawBody.phone);
    const normalizedTelegram = typeof rawBody.telegram === "string"
      ? rawBody.telegram.trim()
      : source === "free_lesson" && normalizedPhone.startsWith("@") ? normalizedPhone : "";

    const parseResult = source === "free_lesson"
      ? freeLessonLeadSchema.safeParse({ ...rawBody, name: normalizedName, phone: normalizedPhone || undefined, telegram: normalizedTelegram || undefined, source })
      : quizLeadSchema.safeParse({ ...rawBody, name: normalizedName, phone: normalizedPhone, source });

    if (!parseResult.success) {
      return NextResponse.json({ error: "Ma'lumotlar noto'g'ri kiritildi", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const telegram = "telegram" in data ? data.telegram : null;
    const isTelegram = telegram !== null && telegram !== undefined;
    const [newLead] = await db.insert(leads).values({
      name: data.name,
      phone: isTelegram ? null : data.phone,
      telegram: isTelegram ? telegram : null,
      source: data.source,
      status: data.status,
      recommendedCourseId: data.recommendedCourseId || null,
      quizAnswers: data.quizAnswers || null,
      utm: data.utm || null,
    }).returning();

    return NextResponse.json(
      {
        success: true,
        message: "Quiz natijasi saqlandi",
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/quiz error:", error);
    return NextResponse.json(
      { error: "Quiz ma'lumotlarini saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
