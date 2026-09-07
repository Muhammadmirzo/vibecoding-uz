import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth/session";
import { studentChangePasswordSchema } from "@/lib/validations";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const authSession = await getAuthSession();
    if (!authSession) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = studentChangePasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;

    // Fetch user's current password hash
    const [userRecord] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, authSession.userId))
      .limit(1);

    if (!userRecord) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    // If user already has a password hash, verify it
    if (userRecord.passwordHash) {
      const isValid = await verifyPassword(currentPassword, userRecord.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Joriy parol noto'g'ri kiritildi" },
          { status: 400 }
        );
      }
    }

    // Hash the new password
    const newHash = await hashPassword(newPassword);

    // Update in database
    await db
      .update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.id, authSession.userId));

    return NextResponse.json({
      success: true,
      message: "Parol muvaffaqiyatli o'zgartirildi!",
    });
  } catch (error) {
    console.error("POST /api/me/password error:", error);
    return NextResponse.json(
      { error: "Parolni o'zgartirishda server xatoligi yuz berdi" },
      { status: 500 }
    );
  }
}
