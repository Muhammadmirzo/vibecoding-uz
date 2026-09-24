import { NextResponse } from "next/server";
import { z } from "zod";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse } from "@/lib/http/errors";
import { drizzlePortfolioRepository } from "@/features/portfolio/server/portfolio.repository";
import { createPortfolio, listPortfolios } from "@/features/portfolio/server/portfolio.service";

const portfolioQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: z.string().max(100).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = portfolioQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    });
    const result = await listPortfolios(drizzlePortfolioRepository, {
      limit: parsed.success ? parsed.data.limit : undefined,
      category: parsed.success ? parsed.data.category : undefined,
    });
    return NextResponse.json({ success: true, portfolios: result.portfolios, total: result.total });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const input = portfolioSchema.parse(await request.json());
    const portfolio = await createPortfolio(drizzlePortfolioRepository, input);
    return NextResponse.json({ success: true, portfolio });
  } catch (error) {
    return errorResponse(error);
  }
}
