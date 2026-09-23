import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { createLeadSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { QUIZ_QUESTIONS } from "@/features/quiz/quizData";

const TELEGRAM_USERNAME_REGEX = /^@[A-Za-z0-9_]{3,}$/;
const UZ_PHONE_REGEX = /^\+998[0-9]{9}$/;

const TELEGRAM_USERNAME_ERROR =
  "Telegram username noto'g'ri (@ bilan, min 4 belgi)";
const UZ_PHONE_ERROR =
  "Telefon raqam +998 bilan 12 xonali bo'lishi kerak (masalan +998901234567)";
const LEAD_NAME_ERROR = "Ismingizni to'liq kiriting (min 2 harf)";

function normalizeLeadName(name: unknown): string {
  return typeof name === "string" ? name.trim() : "";
}

function normalizeLeadPhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  const trimmed = phone.trim();
  if (trimmed.startsWith("@")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("998")) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  if (trimmed.startsWith("+")) return `+${digits}`;
  return digits ? `+${digits}` : trimmed;
}

function validateLeadName(name: string): { ok: true } | { ok: false; error: string } {
  if (name.trim().length >= 2) return { ok: true };
  return { ok: false, error: LEAD_NAME_ERROR };
}

function validateLeadContact(
  phone: string
): { ok: true } | { ok: false; error: string } {
  if (phone.startsWith("@")) {
    if (TELEGRAM_USERNAME_REGEX.test(phone)) return { ok: true };
    return { ok: false, error: TELEGRAM_USERNAME_ERROR };
  }
  if (UZ_PHONE_REGEX.test(phone)) return { ok: true };
  return { ok: false, error: UZ_PHONE_ERROR };
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

    const normalizedName = normalizeLeadName(rawBody.name);
    const normalizedPhone = normalizeLeadPhone(rawBody.phone);

    const nameCheck = validateLeadName(normalizedName);
    if (!nameCheck.ok) {
      return NextResponse.json({ error: nameCheck.error }, { status: 400 });
    }

    const contactCheck = validateLeadContact(normalizedPhone);
    if (!contactCheck.ok) {
      return NextResponse.json({ error: contactCheck.error }, { status: 400 });
    }

    const parseResult = createLeadSchema.safeParse({
      source: "quiz",
      ...rawBody,
      name: normalizedName,
      phone: normalizedPhone,
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
