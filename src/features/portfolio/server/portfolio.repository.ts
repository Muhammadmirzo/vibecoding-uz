// NOTE(W5-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { portfolios } from "@/db/schema";
import type { PortfolioInput, PortfolioUpdateInput } from "@/lib/validations/portfolio";

export type PortfolioRow = typeof portfolios.$inferSelect;

export interface PortfolioRepository {
  listOrdered(limit: number): Promise<PortfolioRow[]>;
  create(input: PortfolioInput): Promise<PortfolioRow>;
  update(id: string, patch: PortfolioUpdateInput): Promise<PortfolioRow | null>;
  remove(id: string): Promise<PortfolioRow | null>;
}

export const drizzlePortfolioRepository: PortfolioRepository = {
  async listOrdered(limit) {
    return db
      .select()
      .from(portfolios)
      .orderBy(asc(portfolios.sortOrder), asc(portfolios.createdAt))
      .limit(limit);
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
};
