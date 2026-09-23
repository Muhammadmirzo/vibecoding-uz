import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { telegramAuthSchema } from "@/lib/validations/telegram";
import { verifyTelegramAuth, isFresh } from "@/lib/telegram/verify";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  PRESETS,
} from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit(ip, PRESETS.LOGIN);
    if (!rl.success) return createRateLimitResponse(rl);

    const body: unknown = await request.json();
    const parsed = telegramAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ma'lumotlar noto'g'ri" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "Xizmat vaqtincha ishlamayapti" }, { status: 500 });
    }

    const authData: Record<string, string | number | undefined> = {
      id: parsed.data.id,
      first_name: parsed.data.first_name,
      ...(parsed.data.last_name ? { last_name: parsed.data.last_name } : {}),
      ...(parsed.data.username ? { username: parsed.data.username } : {}),
      ...(parsed.data.photo_url ? { photo_url: parsed.data.photo_url } : {}),
      auth_date: parsed.data.auth_date,
      hash: parsed.data.hash,
    };

    const valid = await verifyTelegramAuth(authData, botToken);
    if (!valid) {
      return NextResponse.json({ error: "Telegram tasdiqlashdan o'tmadi" }, { status: 401 });
    }

    if (!isFresh(parsed.data.auth_date)) {
      return NextResponse.json({ error: "Telegram ma'lumoti eskirgan" }, { status: 401 });
    }

    const tgId = String(parsed.data.id);
    const tgUsername = parsed.data.username ?? null;
    const fullName = [parsed.data.first_name, parsed.data.last_name]
      .filter(Boolean)
      .join(" ")
      .slice(0, 200);
    const avatarUrl = parsed.data.photo_url ?? null;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.tgUserId, tgId))
      .limit(1);
    const user = existing[0];

    if (!user) {
      // users.phone is NOT NULL — never invent a fake phone. Client must link phone first.
      return NextResponse.json(
        {
          error: "Telefon raqamni ulash talab qilinadi",
          code: "phone_link_required",
          tgUserId: tgId,
          tgUsername,
          fullName,
        },
        { status: 422 }
      );
    }

    await db
      .update(users)
      .set({
        tgUsername: tgUsername ?? user.tgUsername,
        avatarUrl: avatarUrl ?? user.avatarUrl,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, user.id));

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const userAgent = request.headers.get("user-agent") || undefined;

    const [session] = await db
      .insert(sessions)
      .values({ userId: user.id, expiresAt, userAgent, ip })
      .returning();

    const token = await createSessionToken({
      sessionId: session ? session.id : user.id,
      userId: user.id,
      role: user.role,
      expiresAt: expiresAt.getTime(),
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: avatarUrl ?? user.avatarUrl,
      },
    });

    const cookieHeader = setSessionCookie(token, {
      maxAgeSeconds: 30 * 24 * 3600,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (error) {
    console.error("Telegram auth error:", error);
    return NextResponse.json({ error: "Tizimda xatolik yuz berdi" }, { status: 500 });
  }
}
