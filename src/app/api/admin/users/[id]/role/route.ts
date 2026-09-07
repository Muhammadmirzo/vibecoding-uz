import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { updateUserRoleSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parseResult = updateUserRoleSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Rol noto'g'ri ko'rsatildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { role } = parseResult.data;

    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        fullName: users.fullName,
        phone: users.phone,
        email: users.email,
        role: users.role,
      });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    // Audit log entry
    await db.insert(auditLogs).values({
      action: "user.role_change",
      entityType: "user",
      entityId: updatedUser.id,
      details: {
        userFullName: updatedUser.fullName,
        userPhone: updatedUser.phone,
        newRole: updatedUser.role,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/role error:", error);
    return NextResponse.json(
      { error: "Foydalanuvchi rolini o'zgartirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
