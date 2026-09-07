import { NextResponse } from "next/server";
import { db } from "@/db";
import { broadcastNotifications, users, enrollments, leads, auditLogs } from "@/db/schema";
import { createBroadcastSchema } from "@/lib/validations";
import { desc, eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(broadcastNotifications)
      .orderBy(desc(broadcastNotifications.createdAt));

    return NextResponse.json({
      success: true,
      broadcasts: list,
    });
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error);
    return NextResponse.json(
      { error: "Xabarnomalar ro'yxatini yuklashda xatolik" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = createBroadcastSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Calculate approximate audience count
    let recipientCount = 0;
    if (data.targetAudience === "all_users") {
      const [res] = await db.select({ total: count(users.id) }).from(users);
      recipientCount = Number(res?.total || 0);
    } else if (data.targetAudience === "active_students") {
      const [res] = await db.select({ total: count(enrollments.id) }).from(enrollments);
      recipientCount = Number(res?.total || 0);
    } else if (data.targetAudience === "cohort_students" && data.cohortId) {
      const [res] = await db
        .select({ total: count(enrollments.id) })
        .from(enrollments)
        .where(eq(enrollments.cohortId, data.cohortId));
      recipientCount = Number(res?.total || 0);
    } else if (data.targetAudience === "leads_new") {
      const [res] = await db
        .select({ total: count(leads.id) })
        .from(leads)
        .where(eq(leads.status, "new"));
      recipientCount = Number(res?.total || 0);
    } else if (data.targetAudience === "leads_consultation") {
      const [res] = await db
        .select({ total: count(leads.id) })
        .from(leads)
        .where(eq(leads.status, "consultation"));
      recipientCount = Number(res?.total || 0);
    } else {
      recipientCount = 15;
    }

    const [newBroadcast] = await db
      .insert(broadcastNotifications)
      .values({
        title: data.title,
        channel: data.channel,
        targetAudience: data.targetAudience,
        cohortId: data.cohortId || null,
        messageBody: data.messageBody,
        status: data.status,
        recipientsCount: recipientCount,
        sentAt: data.status === "sent" ? new Date() : null,
      })
      .returning();

    // Audit log
    await db.insert(auditLogs).values({
      action: "notification.broadcast",
      entityType: "broadcast_notification",
      entityId: newBroadcast.id,
      details: {
        title: newBroadcast.title,
        channel: newBroadcast.channel,
        recipientsCount: recipientCount,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json(
      {
        success: true,
        broadcast: newBroadcast,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/notifications error:", error);
    return NextResponse.json(
      { error: "Xabarnoma yuborishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
