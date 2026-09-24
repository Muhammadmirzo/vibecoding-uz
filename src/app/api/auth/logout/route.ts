import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  createClearSessionCookieHeader,
} from "@/lib/auth/session";
import { drizzleAuthSessionRepository } from "@/features/auth/server/auth-session.repository";
import { logoutSession } from "@/features/auth/server/session.service";

export async function POST() {
  const clearCookieHeader = createClearSessionCookieHeader();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    await logoutSession(
      drizzleAuthSessionRepository,
      { verify: (value) => verifySessionToken(value) },
      token,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Tizimdan muvaffaqiyatli chiqildi",
      },
      { headers: { "Set-Cookie": clearCookieHeader } },
    );
  } catch {
    // Still ensure cookie is cleared even if DB deletion fails
    return NextResponse.json(
      {
        success: true,
        message: "Tizimdan chiqildi",
      },
      { headers: { "Set-Cookie": clearCookieHeader } },
    );
  }
}
