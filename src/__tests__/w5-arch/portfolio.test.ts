import { describe, expect, it } from "vitest";
import {
  createPortfolio,
  deletePortfolio,
  listPortfolios,
  updatePortfolio,
} from "@/features/portfolio/server/portfolio.service";
import type { PortfolioRepository, PortfolioRow } from "@/features/portfolio/server/portfolio.repository";
import { PORTFOLIO_DATA } from "@/features/portfolio/portfolioData";
import type { PortfolioInput } from "@/lib/validations/portfolio";

function makeRow(overrides: Partial<PortfolioRow> = {}): PortfolioRow {
  return {
    id: "55555555-5555-4555-8555-555555555555",
    slug: "demo",
    title: "Demo",
    url: "https://demo.example",
    domain: "demo.example",
    category: "Startup MVP",
    description: "Demo description",
    imageUrl: "",
    userCount: null,
    badgeText: "Shu metod bilan qurilgan",
    isFeatured: true,
    sortOrder: 0,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeRepo(rows: PortfolioRow[] | null): PortfolioRepository {
  return {
    listOrdered: async (limit) => {
      if (rows === null) throw new Error("db down");
      return rows.slice(0, limit);
    },
    create: async (input) => makeRow({ ...input, id: "new-id" }),
    update: async (id, patch) => {
      if (id === "missing") return null;
      return makeRow({ id, ...(patch as Partial<PortfolioRow>) });
    },
    remove: async (id) => (id === "missing" ? null : makeRow({ id })),
  };
}

describe("portfolio service", () => {
  it("lists DB rows and filters by category after the limit", async () => {
    const repo = makeRepo([
      makeRow({ id: "a", category: "Startup MVP" }),
      makeRow({ id: "b", category: "EdTech" }),
    ]);
    const all = await listPortfolios(repo, {});
    expect(all.total).toBe(2);
    const filtered = await listPortfolios(repo, { category: "EdTech" });
    expect(filtered.portfolios.map((p) => (p as PortfolioRow).id)).toEqual(["b"]);
    const reset = await listPortfolios(repo, { category: "Barchasi" });
    expect(reset.total).toBe(2);
  });

  it("falls back to static seed data when the table is empty or unreachable", async () => {
    const empty = await listPortfolios(makeRepo([]), { limit: 3 });
    expect(empty.portfolios).toHaveLength(Math.min(3, PORTFOLIO_DATA.length));
    expect(empty.total).toBe(PORTFOLIO_DATA.length);

    const down = await listPortfolios(makeRepo(null), {});
    expect(down.portfolios).toEqual(PORTFOLIO_DATA);
    expect(down.total).toBe(PORTFOLIO_DATA.length);
  });

  it("creates portfolios via the repository", async () => {
    const input: PortfolioInput = {
      title: "New",
      slug: "new",
      url: "https://new.example",
      domain: "new.example",
      category: "AI Bot",
      description: "Fresh project",
      imageUrl: "",
      badgeText: "Shu metod bilan qurilgan",
      isFeatured: true,
      sortOrder: 1,
    };
    const row = await createPortfolio(makeRepo([]), input);
    expect(row).toMatchObject({ id: "new-id", title: "New", category: "AI Bot" });
  });

  it("throws NOT_FOUND when updating or deleting a missing row", async () => {
    const repo = makeRepo([]);
    await expect(updatePortfolio(repo, "missing", { title: "x" })).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
    await expect(deletePortfolio(repo, "missing")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
    await expect(updatePortfolio(repo, "a", { title: "y" })).resolves.toMatchObject({ id: "a" });
    await expect(deletePortfolio(repo, "a")).resolves.toMatchObject({ id: "a" });
  });
});
