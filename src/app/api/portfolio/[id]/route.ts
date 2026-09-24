import { NextResponse } from "next/server";
import { z } from "zod";
import { portfolioUpdateSchema } from "@/lib/validations/portfolio";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse } from "@/lib/http/errors";
import { drizzlePortfolioRepository } from "@/features/portfolio/server/portfolio.repository";
import { deletePortfolio, updatePortfolio } from "@/features/portfolio/server/portfolio.service";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { id } = paramsSchema.parse(await params);
    const patch = portfolioUpdateSchema.parse(await request.json());
    const portfolio = await updatePortfolio(drizzlePortfolioRepository, id, patch);
    return NextResponse.json({ success: true, portfolio });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { id } = paramsSchema.parse(await params);
    await deletePortfolio(drizzlePortfolioRepository, id);
    return NextResponse.json({
      success: true,
      message: "Portfolio muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
