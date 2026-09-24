import { describe, expect, it, vi } from "vitest";
import { logoutSession } from "@/features/auth/server/session.service";
import type { AuthSessionRepository } from "@/features/auth/server/auth-session.repository";

function makeRepo(deleted: string[], fail = false): AuthSessionRepository {
  return {
    createSession: async () => ({ id: "sess-1" }),
    createSessionTx: async () => ({ id: "sess-1" }),
    deleteSession: async (sessionId) => {
      if (fail) throw new Error("db down");
      deleted.push(sessionId);
    },
  };
}

describe("logoutSession", () => {
  it("deletes the session row for a valid token", async () => {
    const deleted: string[] = [];
    const result = await logoutSession(
      makeRepo(deleted),
      { verify: async () => ({ sessionId: "sess-abc" }) },
      "valid.token",
    );
    expect(result).toEqual({ revoked: true });
    expect(deleted).toEqual(["sess-abc"]);
  });

  it("is a no-op without a token or session id", async () => {
    const deleted: string[] = [];
    const verify = vi.fn(async () => null);
    await expect(logoutSession(makeRepo(deleted), { verify }, null)).resolves.toEqual({ revoked: false });
    await expect(logoutSession(makeRepo(deleted), { verify }, undefined)).resolves.toEqual({ revoked: false });
    await expect(logoutSession(makeRepo(deleted), { verify }, "bad.token")).resolves.toEqual({
      revoked: false,
    });
    expect(verify).toHaveBeenCalledTimes(1);
    expect(deleted).toHaveLength(0);
  });

  it("is a no-op when verification throws, and maps delete failures to 503", async () => {
    const deleted: string[] = [];
    await expect(
      logoutSession(
        makeRepo(deleted),
        {
          verify: async () => {
            throw new Error("bad signature");
          },
        },
        "broken.token",
      ),
    ).resolves.toEqual({ revoked: false });

    await expect(
      logoutSession(makeRepo(deleted, true), { verify: async () => ({ sessionId: "s1" }) }, "t"),
    ).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE", status: 503 });
  });
});
