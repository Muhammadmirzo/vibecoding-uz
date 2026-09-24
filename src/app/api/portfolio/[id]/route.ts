import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, type AuthSession } from "@/lib/auth/require-auth";
import { errorResponse } from "@/lib/http/errors";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";
import { portfolioUpdateSchema } from "@/lib/validations/portfolio";
import { drizzlePortfolioRepository } from "@/features/portfolio/server/portfolio.repository";
import { deletePortfolio, updatePortfolio } from "@/features/portfolio/server/portfolio.service";

const paramsSchema = z.object({ id: z.string().uuid() });
const PORTFOLIO_WRITE_LIMIT = { limit: 30, windowSeconds: 60, prefix: "portfolio-write" } as const;

async function allowWrite(request: Request): Promise<{ ok: true; session: AuthSession } | { ok: false; response: Response }> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth;
  const limit = await checkRateLimit(getClientIp(request), PORTFOLIO_WRITE_LIMIT);
  if (!limit.success) return { ok: false, response: createRateLimitResponse(limit) };
  return { ok: true, session: auth.session };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await allowWrite(request);
    if (!auth.ok) return auth.response;
    const { id } = paramsSchema.parse(await params);
    const patch = portfolioUpdateSchema.parse(await request.json());
    const portfolio = await updatePortfolio(drizzlePortfolioRepository, id, patch, auth.session);
    revalidateTag("portfolio");
    return NextResponse.json({ success: true, portfolio });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await allowWrite(request);
    if (!auth.ok) return auth.response;
    const { id } = paramsSchema.parse(await params);
    await deletePortfolio(drizzlePortfolioRepository, id, auth.session);
    revalidateTag("portfolio");
    return NextResponse.json({ success: true, message: "Portfolio muvaffaqiyatli o'chirildi" });
  } catch (error) {
    return errorResponse(error);
  }
}
