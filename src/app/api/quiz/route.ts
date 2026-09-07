import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { createLeadSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { QUIZ_QUESTIONS } from "@/features/quiz/quizData";

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
    const parseResult = createLeadSchema.safeParse({
      source: "quiz",
      ...body,
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

    const [newLead] = await db
      .insert(leads)
      .values({
        name: data.name,
        phone: data.phone,
        source: data.source,
        status: data.status,
        recommendedCourseId: data.recommendedCourseId || null,
        quizAnswers: data.quizAnswers || null,
        utm: data.utm || null,
      })
      .returning();

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
