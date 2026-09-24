import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({
  db: { delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })) },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));

import { POST as logoutPost } from "@/app/api/auth/logout/route";

describe("W1-SEC: logout clears the session cookie", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends a Set-Cookie clear header even with no session", async () => {
    const res = await logoutPost();
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("session_token=;");
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });
});
