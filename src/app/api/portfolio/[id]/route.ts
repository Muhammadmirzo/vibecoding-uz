import { NextResponse } from "next/server";
import { db } from "@/db";
import { portfolios } from "@/db/schema";
import { portfolioUpdateSchema } from "@/lib/validations/portfolio";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parseResult = portfolioUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Kiritilgan ma'lumotlar noto'g'ri", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await db
      .update(portfolios)
      .set(parseResult.data)
      .where(eq(portfolios.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Loyiha topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      portfolio: updated[0],
    });
  } catch (error) {
    console.error("PATCH /api/portfolio/[id] error:", error);
    return NextResponse.json(
      { error: "Portfolioni yangilashda xatolik" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db
      .delete(portfolios)
      .where(eq(portfolios.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Loyiha topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.error("DELETE /api/portfolio/[id] error:", error);
    return NextResponse.json(
      { error: "Portfolioni o'chirishda xatolik" },
      { status: 500 }
    );
  }
}
