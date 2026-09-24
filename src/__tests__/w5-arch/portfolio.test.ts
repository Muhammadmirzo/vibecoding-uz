import { describe, expect, it } from "vitest";
import { createPortfolio, deletePortfolio, listPortfolios, updatePortfolio } from "@/features/portfolio/server/portfolio.service";
import type { PortfolioRepository, PortfolioRow } from "@/features/portfolio/server/portfolio.repository";
import { VERIFIED_PORTFOLIO_FALLBACK } from "@/features/portfolio/portfolioData";
import type { PortfolioInput } from "@/lib/validations/portfolio";

const actor = { userId: "admin" };

function makeRow(overrides: Partial<PortfolioRow> = {}): PortfolioRow {
  return {
    id: "55555555-5555-4555-8555-555555555555", slug: "demo", title: "Demo", url: "https://demo.example", domain: "demo.example", category: "Startup MVP",
    description: "Demo description", imageUrl: "", coverUrl: "", liveUrl: "", repoUrl: "", userCount: null, badgeText: "Naqsh metodi bilan qurilgan",
    isFeatured: false, ownership: "demo", featuredRank: null, sortOrder: 0, status: "published", techStack: [], highlights: [], publishedAt: new Date("2026-01-01"), createdAt: new Date("2026-01-01"), ...overrides,
  };
}

function makeRepo(rows: PortfolioRow[] | null): PortfolioRepository {
  return {
    listOrdered: async (limit) => rows === null ? Promise.reject(new Error("db down")) : rows.slice(0, limit),
    listPublished: async () => rows ?? Promise.reject(new Error("db down")),
    listFeatured: async () => (rows ?? []).filter((row) => row.isFeatured).map(({ id }) => ({ id })),
    nextSortOrder: async () => (rows ?? []).length,
    create: async (input) => makeRow({ ...input, id: "new-id", publishedAt: input.publishedAt }),
    update: async (id, patch) => (id === "missing" ? null : makeRow({ id, ...patch })),
    remove: async (id) => (id === "missing" ? null : makeRow({ id })),
    audit: async () => undefined,
  };
}

describe("portfolio service", () => {
  it("lists DB rows and filters by ownership", async () => {
    const repo = makeRepo([makeRow({ id: "a", ownership: "owner" }), makeRow({ id: "b", ownership: "student" })]);
    expect((await listPortfolios(repo, {})).total).toBe(2);
    expect((await listPortfolios(repo, { ownership: "student" })).portfolios.map((item) => item.id)).toEqual(["b"]);
  });

  it("falls back only to verified owner projects when DB is unreachable", async () => {
    const down = await listPortfolios(makeRepo(null), {});
    expect(down.portfolios).toEqual(VERIFIED_PORTFOLIO_FALLBACK);
    expect(down.portfolios.every((item) => item.ownership === "owner" && item.status === "published")).toBe(true);
  });

  it("enforces the server-side three-featured limit", async () => {
    const repo = makeRepo([makeRow({ id: "a", isFeatured: true }), makeRow({ id: "b", isFeatured: true }), makeRow({ id: "c", isFeatured: true })]);
    const input: PortfolioInput = { title: "New", slug: "new", url: "https://new.example", domain: "new.example", category: "AI Bot", description: "Fresh project", imageUrl: "", coverUrl: "", liveUrl: "", repoUrl: "", badgeText: "Naqsh metodi bilan qurilgan", isFeatured: true, featuredRank: 1, sortOrder: 0, ownership: "owner", status: "draft", techStack: [], highlights: [] };
    await expect(createPortfolio(repo, input, actor)).rejects.toMatchObject({ code: "FEATURED_LIMIT", status: 409 });
  });

  it("writes, updates, and deletes with audit calls", async () => {
    const repo = makeRepo([makeRow({ id: "a" })]);
    await expect(updatePortfolio(repo, "missing", { title: "x" }, actor)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(deletePortfolio(repo, "missing", actor)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(updatePortfolio(repo, "a", { title: "y" }, actor)).resolves.toMatchObject({ id: "a" });
    await expect(deletePortfolio(repo, "a", actor)).resolves.toMatchObject({ id: "a" });
  });
});
