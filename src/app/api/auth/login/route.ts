import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/validations";
import { normalizePhone, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rlResult = await checkRateLimit(ip, PRESETS.LOGIN);
    if (!rlResult.success) {
      return createRateLimitResponse(rlResult);
    }

    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { phone, password = "" } = parseResult.data;
    const normalized = normalizePhone(phone);

    const userList = await db.select().from(users).where(eq(users.phone, normalized)).limit(1);
    const user = userList[0];

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Telefon raqam yoki parol noto'g'ri" }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Telefon raqami yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    // Ensure profile exists for user
    await db
      .insert(userProfiles)
      .values({ userId: user.id })
      .onConflictDoNothing();

    // Create session record
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const userAgent = request.headers.get("user-agent") || undefined;

    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        expiresAt,
        userAgent,
        ip,
      })
      .returning();

    // Update last login timestamp
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Generate token and set HTTP-only cookie
    const token = await createSessionToken({
      sessionId: session.id,
      userId: user.id,
      role: user.role,
      expiresAt: expiresAt.getTime(),
    });

    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Tizimda xatolik yuz berdi. Qaytadan urinib ko'ring." },
      { status: 500 }
    );
  }
}
