import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateLeadSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parseResult = updateLeadSchema.safeParse(body);

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

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.recommendedCourseId !== undefined) updateData.recommendedCourseId = data.recommendedCourseId;
    if (data.quizAnswers !== undefined) updateData.quizAnswers = data.quizAnswers;
    if (data.utm !== undefined) updateData.utm = data.utm;
    if (data.assignedManagerId !== undefined) updateData.assignedManagerId = data.assignedManagerId;
    if (data.nextContactAt !== undefined) {
      updateData.nextContactAt = data.nextContactAt ? new Date(data.nextContactAt) : null;
    }

    const [updatedLead] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();

    if (!updatedLead) {
      return NextResponse.json(
        { error: "Lead topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("PATCH /api/admin/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Leadni yangilashda xatolik yuz berdi" },
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
      .delete(leads)
      .where(eq(leads.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Lead topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.error("DELETE /api/admin/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Leadni o'chirishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
