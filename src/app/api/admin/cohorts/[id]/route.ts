import { NextResponse } from "next/server";
import { db } from "@/db";
import { cohorts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateCohortSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parseResult = updateCohortSchema.safeParse(body);

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
    const updateData: Record<string, unknown> = {};

    if (data.courseId !== undefined) updateData.courseId = data.courseId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
    if (data.endsAt !== undefined) updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    if (data.seats !== undefined) updateData.seats = data.seats;
    if (data.priceSum !== undefined) updateData.priceSum = data.priceSum;
    if (data.earlyPriceSum !== undefined) updateData.earlyPriceSum = data.earlyPriceSum;
    if (data.earlyDeadline !== undefined) {
      updateData.earlyDeadline = data.earlyDeadline ? new Date(data.earlyDeadline) : null;
    }
    if (data.telegramChatId !== undefined) updateData.telegramChatId = data.telegramChatId;
    if (data.status !== undefined) updateData.status = data.status;

    const [updatedCohort] = await db
      .update(cohorts)
      .set(updateData)
      .where(eq(cohorts.id, id))
      .returning();

    if (!updatedCohort) {
      return NextResponse.json(
        { error: "Guruh topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cohort: updatedCohort,
    });
  } catch (error) {
    console.error("PATCH /api/admin/cohorts/[id] error:", error);
    return NextResponse.json(
      { error: "Guruh ma'lumotlarini yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(cohorts)
      .where(eq(cohorts.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Guruh topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Guruh o'chirildi",
    });
  } catch (error) {
    console.error("DELETE /api/admin/cohorts/[id] error:", error);
    return NextResponse.json(
      { error: "Guruhni o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
