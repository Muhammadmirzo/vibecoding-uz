import { unstable_cache } from "next/cache";
import { ServiceError } from "@/lib/http/errors";
import {
  MAX_FEATURED_PORTFOLIOS,
  type PortfolioInput,
  type PortfolioUpdateInput,
} from "@/lib/validations/portfolio";
import { VERIFIED_PORTFOLIO_FALLBACK, type PortfolioItem } from "../portfolioData";
import { drizzlePortfolioRepository, type PortfolioRepository, type PortfolioRow } from "./portfolio.repository";

export interface PortfolioListQuery { limit?: number; ownership?: string }
export interface PortfolioListOutcome { portfolios: PortfolioItem[]; total: number }
export interface AuditActor { userId: string }

function toPublicItem(row: PortfolioRow): PortfolioItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    url: row.url,
    domain: row.domain,
    category: row.category,
    description: row.description,
    imageUrl: row.imageUrl,
    coverUrl: row.coverUrl,
    liveUrl: row.liveUrl,
    repoUrl: row.repoUrl,
    userCount: row.userCount,
    badgeText: row.badgeText,
    isFeatured: row.isFeatured,
    featuredRank: row.featuredRank,
    sortOrder: row.sortOrder,
    ownership: row.ownership as PortfolioItem["ownership"],
    status: row.status as PortfolioItem["status"],
    techStack: row.techStack,
    highlights: row.highlights,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

const readCachedPublished = unstable_cache(
  async (): Promise<PortfolioItem[]> => {
    try {
      return (await drizzlePortfolioRepository.listPublished()).map(toPublicItem);
    } catch (error) {
      console.error("[portfolio] DB read failed; using verified fallback", error);
      return VERIFIED_PORTFOLIO_FALLBACK;
    }
  },
  ["portfolio-public-v1"],
  { tags: ["portfolio"], revalidate: 300 },
);

export async function getPublicPortfolios(): Promise<PortfolioListOutcome> {
  const portfolios = await readCachedPublished();
  return { portfolios, total: portfolios.length };
}

export async function listPortfolios(
  repo: PortfolioRepository,
  query: PortfolioListQuery,
): Promise<PortfolioListOutcome> {
  const limit = query.limit ?? 100;
  let rows: PortfolioRow[];
  try {
    rows = await repo.listOrdered(limit);
  } catch {
    return { portfolios: VERIFIED_PORTFOLIO_FALLBACK.slice(0, limit), total: VERIFIED_PORTFOLIO_FALLBACK.length };
  }
  const items = rows.map(toPublicItem).filter((item) => !query.ownership || item.ownership === query.ownership);
  return { portfolios: items, total: items.length };
}

function assertFeaturedCapacity(repo: PortfolioRepository, currentId?: string): Promise<void> {
  return repo.listFeatured().then((featured) => {
    const active = featured.filter((item) => item.id !== currentId);
    if (active.length >= MAX_FEATURED_PORTFOLIOS) {
      throw new ServiceError("FEATURED_LIMIT", "Bosh sahifada ko'pi bilan 3 ta asosiy loyiha bo'lishi mumkin", 409);
    }
  });
}

export async function createPortfolio(repo: PortfolioRepository, input: PortfolioInput, actor: AuditActor): Promise<PortfolioRow> {
  const featured = input.isFeatured || input.featuredRank != null;
  if (featured) await assertFeaturedCapacity(repo);
  const featuredRank = featured ? (input.featuredRank ?? (await repo.listFeatured()).length + 1) : null;
  const row = await repo.create({
    ...input,
    isFeatured: featured,
    featuredRank,
    sortOrder: await repo.nextSortOrder(),
    publishedAt: input.status === "published" ? new Date(input.publishedAt ?? Date.now()) : null,
  });
  await repo.audit({ userId: actor.userId, action: "portfolio.create", entityId: row.id, details: { title: row.title, ownership: row.ownership, status: row.status } });
  return row;
}

export async function updatePortfolio(repo: PortfolioRepository, id: string, patch: PortfolioUpdateInput, actor: AuditActor): Promise<PortfolioRow> {
  const current = (await repo.listOrdered(100000)).find((item) => item.id === id);
  if (!current) throw new ServiceError("NOT_FOUND", "Loyiha topilmadi", 404);
  const willFeature = patch.isFeatured ?? current.isFeatured;
  const requestedRank = patch.featuredRank === undefined ? current.featuredRank : patch.featuredRank;
  if (willFeature || requestedRank != null) await assertFeaturedCapacity(repo, id);
  const rank = willFeature ? (requestedRank ?? (await repo.listFeatured()).filter((item) => item.id !== id).length + 1) : null;
  const status = patch.status ?? current.status;
  const updated = await repo.update(id, {
    ...patch,
    isFeatured: willFeature,
    featuredRank: rank,
    publishedAt: status === "published" ? new Date(patch.publishedAt ?? current.publishedAt ?? Date.now()) : null,
  });
  if (!updated) throw new ServiceError("NOT_FOUND", "Loyiha topilmadi", 404);
  await repo.audit({ userId: actor.userId, action: "portfolio.update", entityId: id, details: patch });
  return updated;
}

export async function deletePortfolio(repo: PortfolioRepository, id: string, actor: AuditActor): Promise<PortfolioRow> {
  const deleted = await repo.remove(id);
  if (!deleted) throw new ServiceError("NOT_FOUND", "Loyiha topilmadi", 404);
  await repo.audit({ userId: actor.userId, action: "portfolio.delete", entityId: id, details: { title: deleted.title } });
  return deleted;
}
