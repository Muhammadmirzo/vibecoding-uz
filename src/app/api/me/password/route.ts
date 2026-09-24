import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { errorResponse } from "@/lib/http/errors";
import { studentChangePasswordSchema } from "@/lib/validations";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { drizzleProfileRepository } from "@/features/crm/server/profile.repository";
import { changeMyPassword } from "@/features/crm/server/profile.service";

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.ok) return authResult.response;
    const body: unknown = await request.json();
    const input = studentChangePasswordSchema.parse(body);
    await changeMyPassword(
      drizzleProfileRepository,
      { hash: hashPassword, verify: verifyPassword },
      authResult.session.userId,
      input,
    );
    return NextResponse.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi!" });
  } catch (error) {
    return errorResponse(error);
  }
}
