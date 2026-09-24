import { and, asc, desc, eq, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, portfolios } from "@/db/schema";
import type { PortfolioInput, PortfolioUpdateInput } from "@/lib/validations/portfolio";

export type PortfolioRow = typeof portfolios.$inferSelect;
export type PortfolioCreateRecord = Omit<PortfolioInput, "publishedAt"> & { publishedAt: Date | null };
export type PortfolioPatchRecord = Omit<PortfolioUpdateInput, "publishedAt"> & { publishedAt?: Date | null };

export interface PortfolioRepository {
  listOrdered(limit: number): Promise<PortfolioRow[]>;
  listPublished(): Promise<PortfolioRow[]>;
  listFeatured(): Promise<Array<Pick<PortfolioRow, "id">>>;
  nextSortOrder(): Promise<number>;
  create(input: PortfolioCreateRecord): Promise<PortfolioRow>;
  update(id: string, patch: PortfolioPatchRecord): Promise<PortfolioRow | null>;
  remove(id: string): Promise<PortfolioRow | null>;
  audit(input: { userId: string; action: string; entityId: string; details: unknown }): Promise<void>;
}

const ownershipPriority = sql<number>`case ${portfolios.ownership}
  when 'owner' then 0 when 'student' then 1 when 'client' then 1 else 2 end`;

export const drizzlePortfolioRepository: PortfolioRepository = {
  async listOrdered(limit) {
    return db.select().from(portfolios)
      .orderBy(ownershipPriority, asc(portfolios.sortOrder), desc(portfolios.createdAt)).limit(limit);
  },
  async listPublished() {
    return db.select().from(portfolios).where(eq(portfolios.status, "published"))
      .orderBy(ownershipPriority, asc(portfolios.featuredRank), asc(portfolios.sortOrder), desc(portfolios.publishedAt));
  },
  async listFeatured() {
    return db.select({ id: portfolios.id }).from(portfolios)
      .where(and(eq(portfolios.status, "published"), or(isNotNull(portfolios.featuredRank), eq(portfolios.isFeatured, true))))
      .orderBy(asc(portfolios.featuredRank));
  },
  async nextSortOrder() {
    const [row] = await db.select({ value: sql<number>`coalesce(max(${portfolios.sortOrder}), -1) + 1` })
      .from(portfolios);
    return row?.value ?? 0;
  },
  async create(input) {
    const [row] = await db.insert(portfolios).values(input).returning();
    return row;
  },
  async update(id, patch) {
    const [row] = await db.update(portfolios).set(patch).where(eq(portfolios.id, id)).returning();
    return row ?? null;
  },
  async remove(id) {
    const [row] = await db.delete(portfolios).where(eq(portfolios.id, id)).returning();
    return row ?? null;
  },
  async audit(input) {
    await db.insert(auditLogs).values({
      userId: input.userId,
      action: input.action,
      entityType: "portfolio",
      entityId: input.entityId,
      details: input.details,
    });
  },
};
