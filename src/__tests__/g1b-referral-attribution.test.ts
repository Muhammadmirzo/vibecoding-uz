import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/ref/[code]/route";
import { carryUtmParams, UTM_KEYS } from "@/features/referrals/domain/utm";
import { isSignupFromRequest } from "@/features/auth/server/telegram-login.service";

function nextRequest(url: string) {
  return new NextRequest(url);
}

describe("/ref/[code] keeps UTM params (g1b)", () => {
  it("carries every utm_* param through the redirect", async () => {
    const response = await GET(
      nextRequest("http://localhost/ref/A1B2C3D4?utm_source=telegram&utm_medium=cpc&utm_campaign=oct&utm_term=ai&utm_content=post1"),
      { params: Promise.resolve({ code: "A1B2C3D4" }) },
    );
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/diagnostika");
    expect(location.searchParams.get("ref")).toBe("A1B2C3D4");
    for (const key of UTM_KEYS) expect(location.searchParams.get(key)).not.toBeNull();
  });

  it("still sets the ref_code cookie and leaves the redirect clean without UTM", async () => {
    const response = await GET(nextRequest("http://localhost/ref/A1B2C3D4"), {
      params: Promise.resolve({ code: "A1B2C3D4" }),
    });
    expect(response.status).toBe(307);
    expect(response.cookies.get("ref_code")?.value).toBe("A1B2C3D4");
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.searchParams.get("utm_source")).toBeNull();
  });

  it("never lets a param grow past the analytics column limit", () => {
    const target = carryUtmParams(new URLSearchParams("utm_source=" + "x".repeat(500)), new URL("http://localhost/diagnostika"));
    expect(target.searchParams.get("utm_source")).toHaveLength(256);
  });

  it("only attributes a referral for an account this login created", () => {
    const requestAt = new Date("2026-09-26T10:00:00Z");
    expect(isSignupFromRequest(new Date("2026-09-26T10:00:05Z"), requestAt)).toBe(true);
    expect(isSignupFromRequest(new Date("2026-09-01T10:00:00Z"), requestAt)).toBe(false);
  });
});

describe("Telegram login reads the referral cookie (g1b)", () => {
  it("passes the ref_code cookie into the service, like phone signup", async () => {
    const readFile = await import("node:fs/promises");
    const source = await readFile.readFile("src/app/api/auth/telegram/status/route.ts", "utf8");
    expect(source).toContain("parseRefCodeCookie");
    expect(source).toContain("refCode:");
    expect(source).toContain("clearRefCodeCookie");
  });

  it("attributes the cookie for a signup inside the same transaction as the session", async () => {
    const { getTelegramLoginStatus } = await import("@/features/auth/server/telegram-login.service");
    const { hashTelegramLoginToken } = await import("@/features/auth/server/telegram-login.service");
    const token = "abcdefghijklmnopqrstuvwxyzABCDEFG";
    const requestCreatedAt = new Date("2026-09-26T10:00:00Z");
    const attributeReferralTx = vi.fn(async () => undefined);
    const referrals = {
      resolveReferrerByCodeTx: vi.fn(async () => ({ id: "referrer-1" })),
      attributeReferralTx,
    };
    const user = {
      id: "22222222-2222-4222-8222-222222222222",
      phone: "+998901234567",
      email: null,
      passwordHash: null,
      fullName: "Ali",
      avatarUrl: null,
      tgUserId: "555",
      tgUsername: "ali",
      role: "student" as const,
      mcpAccess: false,
      locale: "uz",
      lastLoginAt: null,
      createdAt: new Date("2026-09-26T10:00:05Z"),
    };
    const result = await getTelegramLoginStatus(
      "11111111-1111-4111-8111-111111111111",
      token,
      { sign: async () => "signed-token" },
      {
        requests: {
          findById: async () => ({
            id: "11111111-1111-4111-8111-111111111111",
            nonceHash: hashTelegramLoginToken(token),
            status: "approved" as const,
            userId: user.id,
            tgUserId: "555",
            createdAt: requestCreatedAt,
            expiresAt: new Date(Date.now() + 60_000),
            approvedAt: new Date(),
            consumedAt: null,
            ip: null,
            userAgent: null,
          }),
          markConsumedTx: async () => true,
        } as never,
        users: { findById: async () => user as never, findByTgId: async () => null },
        sessions: { createSessionTx: async () => ({ id: "session-1" }) },
        transaction: (async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({})) as never,
        referrals,
      },
      { refCode: "A1B2C3D4" },
    );
    expect(result.state).toBe("approved");
    expect(result.refCodeAttributed).toBe(true);
    expect(attributeReferralTx).toHaveBeenCalledWith(expect.anything(), "referrer-1", user.id);
  });
});
