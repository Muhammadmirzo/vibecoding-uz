import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, enrollments, auditLogs } from "@/db/schema";
import { createStaffSchema } from "@/lib/validations";
import { hashPassword, normalizePhone } from "@/lib/auth/password";
import { desc, eq, like, or, count } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const conditions = [];

    if (role && role !== "all") {
      // role enum type check
      conditions.push(eq(users.role, role as "superadmin" | "admin" | "manager" | "mentor" | "student"));
    }

    if (search) {
      conditions.push(
        or(
          like(users.fullName, `%${search}%`),
          like(users.phone, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    const rawUsers = await db
      .select({
        id: users.id,
        phone: users.phone,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        tgUsername: users.tgUsername,
        role: users.role,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        enrolledCount: count(enrollments.id),
      })
      .from(users)
      .leftJoin(enrollments, eq(enrollments.userId, users.id))
      .where(conditions.length > 0 ? or(...conditions) : undefined)
      .groupBy(users.id)
      .orderBy(desc(users.createdAt));

    const formatted = rawUsers.map((u) => ({
      ...u,
      enrolledCount: Number(u.enrolledCount || 0),
    }));

    return NextResponse.json({
      success: true,
      users: formatted,
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Foydalanuvchilarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = createStaffSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { phone, fullName, email, password, role } = parseResult.data;

    const normalized = normalizePhone(phone);

    // Check existing phone
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, normalized))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Ushbu telefon raqamli foydalanuvchi allaqachon mavjud" },
        { status: 400 }
      );
    }

    // Check existing email if provided
    if (email) {
      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.trim()))
        .limit(1);

      if (existingEmail) {
        return NextResponse.json(
          { error: "Ushbu email adresi boshqa foydalanuvchi tomonidan ishlatilmoqda" },
          { status: 400 }
        );
      }
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        phone: normalized,
        fullName,
        email: email ? email.trim() : null,
        passwordHash,
        role,
      })
      .returning({
        id: users.id,
        phone: users.phone,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        createdAt: users.createdAt,
      });

    // Record audit log
    await db.insert(auditLogs).values({
      action: "user.create",
      entityType: "user",
      entityId: newUser.id,
      details: {
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Yangi xodim yaratishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
