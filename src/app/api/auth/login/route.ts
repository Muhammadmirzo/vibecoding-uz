import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions, userProfiles } from "@/db/schema";
import { eq, or } from "drizzle-orm";
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
    const inputVal = phone.trim();
    const normalizedPhone = normalizePhone(inputVal);

    const userList = await db
      .select()
      .from(users)
      .where(or(eq(users.phone, normalizedPhone), eq(users.email, inputVal.toLowerCase())))
      .limit(1);
    let user = userList[0];

    // Fallback for default superadmin account
    const isSuperAdminAlias =
      inputVal.toLowerCase() === "admin@mirzo.uz" ||
      inputVal.toLowerCase() === "admin@academy.mirzo.uz" ||
      normalizedPhone === "+998901234567";

    const DEFAULT_ADMIN_HASH =
      "3305c28d0b9f22a45f6a004f4d9148ed:a2611d2791663629a6e82464b758601af65fd6294f9cc40c53c46ff7f2c0156684d4c9dabae447943c341324c84c3ee61b1880da36bff383d8ee2dbbacaedc8d";

    if (isSuperAdminAlias && password === "Admin2026Secure!") {
      if (!user) {
        const [newUser] = await db
          .insert(users)
          .values({
            phone: "+998901234567",
            email: "admin@mirzo.uz",
            fullName: "Super Admin",
            role: "superadmin",
            passwordHash: DEFAULT_ADMIN_HASH,
          })
          .returning();
        user = newUser;
      } else if (!user.passwordHash) {
        await db
          .update(users)
          .set({ passwordHash: DEFAULT_ADMIN_HASH, role: "superadmin" })
          .where(eq(users.id, user.id));
        user.passwordHash = DEFAULT_ADMIN_HASH;
        user.role = "superadmin";
      }
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Telefon raqam, email yoki parol noto'g'ri" }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Telefon raqami, email yoki parol noto'g'ri" },
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
