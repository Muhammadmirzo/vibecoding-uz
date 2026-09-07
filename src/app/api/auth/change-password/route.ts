import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword, normalizePhone } from "@/lib/auth/password";
import { changePasswordSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

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
    const parseResult = changePasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { oldPassword, newPassword, phone, email } = parseResult.data;

    // Fetch user from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authSession.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    // Verify old password if passwordHash exists on user
    if (user.passwordHash) {
      const isOldPasswordCorrect = await verifyPassword(oldPassword, user.passwordHash);
      if (!isOldPasswordCorrect) {
        return NextResponse.json(
          { error: "Eski parol noto'g'ri kiritildi" },
          { status: 400 }
        );
      }
    }

    const updatesToApply: {
      passwordHash?: string;
      phone?: string;
      email?: string | null;
    } = {};

    // 1. Password update
    if (newPassword) {
      const newHash = await hashPassword(newPassword);
      updatesToApply.passwordHash = newHash;
    }

    // 2. Phone update (if provided and changed)
    if (phone) {
      const normalized = normalizePhone(phone);
      if (normalized !== user.phone) {
        const [existingPhone] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.phone, normalized))
          .limit(1);

        if (existingPhone && existingPhone.id !== user.id) {
          return NextResponse.json(
            { error: "Ushbu telefon raqam boshqa foydalanuvchi tomonidan ishlatilmoqda" },
            { status: 400 }
          );
        }
        updatesToApply.phone = normalized;
      }
    }

    // 3. Email update (if provided and changed)
    if (email !== undefined) {
      const formattedEmail = email ? email.trim() : null;
      if (formattedEmail !== user.email) {
        if (formattedEmail) {
          const [existingEmail] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, formattedEmail))
            .limit(1);

          if (existingEmail && existingEmail.id !== user.id) {
            return NextResponse.json(
              { error: "Ushbu email adresi boshqa foydalanuvchi tomonidan ishlatilmoqda" },
              { status: 400 }
            );
          }
        }
        updatesToApply.email = formattedEmail;
      }
    }

    if (Object.keys(updatesToApply).length > 0) {
      await db
        .update(users)
        .set(updatesToApply)
        .where(eq(users.id, user.id));
    }

    // Write Audit Log
    await db.insert(auditLogs).values({
      action: "auth.change_password",
      entityType: "user",
      entityId: user.id,
      details: {
        userId: user.id,
        passwordUpdated: !!newPassword,
        phoneUpdated: !!updatesToApply.phone,
        emailUpdated: updatesToApply.email !== undefined,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "Parol va ma'lumotlar muvaffaqiyatli yangilandi",
    });
  } catch (error) {
    console.error("POST /api/auth/change-password error:", error);
    return NextResponse.json(
      { error: "Parolni o'zgartirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
