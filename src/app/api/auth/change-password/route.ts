import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { changePasswordSchema } from "@/lib/validations";
import { errorResponse } from "@/lib/http/errors";
import { drizzleAuthUserRepository } from "@/features/auth/server/auth-user.repository";
import { changeCredentials } from "@/features/auth/server/change-password.service";

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.ok) return authResult.response;

    const input = changePasswordSchema.parse(await request.json());
    await changeCredentials(
      drizzleAuthUserRepository,
      { hash: hashPassword, verify: verifyPassword },
      authResult.session.userId,
      input,
      request.headers.get("x-forwarded-for") || "127.0.0.1",
    );

    return NextResponse.json({
      success: true,
      message: "Parol va ma'lumotlar muvaffaqiyatli yangilandi",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
