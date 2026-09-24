import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse } from "@/lib/http/errors";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { drizzlePortfolioRepository } from "@/features/portfolio/server/portfolio.repository";
import { createPortfolio, getPublicPortfolios, listPortfolios } from "@/features/portfolio/server/portfolio.service";

const PORTFOLIO_WRITE_LIMIT = { limit: 30, windowSeconds: 60, prefix: "portfolio-write" } as const;

export async function GET(request: Request) {
  try {
    const adminScope = new URL(request.url).searchParams.get("scope") === "admin";
    if (!adminScope) {
      const result = await getPublicPortfolios();
      return NextResponse.json({ success: true, portfolios: result.portfolios, total: result.total });
    }
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const result = await listPortfolios(drizzlePortfolioRepository, {});
    return NextResponse.json({ success: true, portfolios: result.portfolios, total: result.total });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const limit = await checkRateLimit(getClientIp(request), PORTFOLIO_WRITE_LIMIT);
    if (!limit.success) return createRateLimitResponse(limit);
    const input = portfolioSchema.parse(await request.json());
    const portfolio = await createPortfolio(drizzlePortfolioRepository, input, auth.session);
    revalidateTag("portfolio");
    return NextResponse.json({ success: true, portfolio }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
