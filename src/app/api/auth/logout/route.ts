import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  removeSessionCookie,
} from "@/lib/auth/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const payload = await verifySessionToken(token);
      if (payload?.sessionId) {
        await db.delete(sessions).where(eq(sessions.id, payload.sessionId));
      }
    }

    await removeSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Tizimdan muvaffaqiyatli chiqildi",
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Still ensure cookie is cleared even if DB deletion fails
    await removeSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Tizimdan chiqildi",
    });
  }
}
