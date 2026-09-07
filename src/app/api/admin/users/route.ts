import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, enrollments } from "@/db/schema";
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
