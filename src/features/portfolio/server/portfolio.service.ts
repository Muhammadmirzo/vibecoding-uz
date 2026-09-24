import { ServiceError } from "@/lib/http/errors";
import type { PortfolioInput, PortfolioUpdateInput } from "@/lib/validations/portfolio";
import { PORTFOLIO_DATA } from "../portfolioData";
import type { PortfolioRepository, PortfolioRow } from "./portfolio.repository";

export interface PortfolioListQuery {
  limit?: number;
  category?: string;
}

export interface PortfolioListOutcome {
  portfolios: (PortfolioRow | (typeof PORTFOLIO_DATA)[number])[];
  total: number;
}

/**
 * Public portfolio listing. The static seed fallback is a deliberate
 * honesty-rule behavior: an empty (or unreachable) table serves the
 * curated fallback instead of an empty page or a 500.
 */
export async function listPortfolios(
  repo: PortfolioRepository,
  query: PortfolioListQuery,
): Promise<PortfolioListOutcome> {
  const limit = query.limit ?? 100;
  let rows: PortfolioRow[];
  try {
    rows = await repo.listOrdered(limit);
  } catch {
    return { portfolios: PORTFOLIO_DATA, total: PORTFOLIO_DATA.length };
  }
  if (rows.length === 0) {
    return { portfolios: PORTFOLIO_DATA.slice(0, limit), total: PORTFOLIO_DATA.length };
  }
  const items =
    query.category && query.category !== "Barchasi"
      ? rows.filter((item) => item.category === query.category)
      : rows;
  return { portfolios: items, total: items.length };
}

export async function createPortfolio(
  repo: PortfolioRepository,
  input: PortfolioInput,
): Promise<PortfolioRow> {
  return repo.create(input);
}

export async function updatePortfolio(
  repo: PortfolioRepository,
  id: string,
  patch: PortfolioUpdateInput,
): Promise<PortfolioRow> {
  const updated = await repo.update(id, patch);
  if (!updated) throw new ServiceError("NOT_FOUND", "Loyiha topilmadi", 404);
  return updated;
}

export async function deletePortfolio(
  repo: PortfolioRepository,
  id: string,
): Promise<PortfolioRow> {
  const deleted = await repo.remove(id);
  if (!deleted) throw new ServiceError("NOT_FOUND", "Loyiha topilmadi", 404);
  return deleted;
}
