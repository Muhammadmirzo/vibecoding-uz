import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  checkRateLimit: vi.fn(async () => ({ success: true, limit: 30, remaining: 29, reset: Date.now() + 60_000 })),
  revalidateTag: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/auth/require-auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/security/rateLimit", () => ({
  checkRateLimit: mocks.checkRateLimit,
  createRateLimitResponse: vi.fn(() => new Response(null, { status: 429 })),
  getClientIp: () => "127.0.0.1",
}));
vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));
vi.mock("@/features/portfolio/server/portfolio.repository", () => ({ drizzlePortfolioRepository: {} }));
vi.mock("@/features/portfolio/server/portfolio.service", () => ({ createPortfolio: mocks.create }));

import { POST } from "@/app/api/portfolio/route";

const validBody = {
  title: "New project", slug: "new-project", url: "https://new.example", domain: "new.example", category: "Startup MVP",
  description: "A useful project", imageUrl: "", coverUrl: "", liveUrl: "", repoUrl: "", badgeText: "Naqsh metodi bilan qurilgan",
  isFeatured: false, sortOrder: 0, ownership: "owner", status: "draft", techStack: [], highlights: [],
};

describe("portfolio write route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ ok: true, session: { userId: "admin", role: "admin", sessionId: "session" } });
    mocks.create.mockResolvedValue({ id: "id", title: "New project" });
  });

  it("returns 401 when the handler has no admin session", async () => {
    mocks.requireAdmin.mockResolvedValue({ ok: false, response: Response.json({ error: "unauthorized" }, { status: 401 }) });
    const response = await POST(new Request("http://localhost/api/portfolio", { method: "POST", body: JSON.stringify(validBody) }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when the authenticated user lacks an admin role", async () => {
    mocks.requireAdmin.mockResolvedValue({ ok: false, response: Response.json({ error: "forbidden" }, { status: 403 }) });
    const response = await POST(new Request("http://localhost/api/portfolio", { method: "POST", body: JSON.stringify(validBody) }));
    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid boundary input", async () => {
    const response = await POST(new Request("http://localhost/api/portfolio", { method: "POST", body: JSON.stringify({ title: "" }) }));
    expect(response.status).toBe(400);
  });

  it("revalidates the portfolio cache after a successful write", async () => {
    const response = await POST(new Request("http://localhost/api/portfolio", { method: "POST", body: JSON.stringify(validBody) }));
    expect(response.status).toBe(201);
    expect(mocks.revalidateTag).toHaveBeenCalledWith("portfolio");
  });
});
