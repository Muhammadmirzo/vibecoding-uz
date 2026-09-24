import { describe, expect, it, beforeEach } from "vitest";
import {
  hashRefreshToken,
  issueTokenPair,
  newRefreshToken,
  rotateRefreshToken,
  REFRESH_TOKEN_TTL_MS,
} from "@/features/mobile/server/token.service";
import type { RefreshTokenRepository, RefreshTokenRow } from "@/features/mobile/server/refresh-token.repository";

process.env.API_JWT_SECRET = "w9-test-secret-please-change-in-prod-123456";

function memoryRepo(): RefreshTokenRepository & { rows: Map<string, RefreshTokenRow> } {
  const rows = new Map<string, RefreshTokenRow>();
  let seq = 0;
  const repo: RefreshTokenRepository & { rows: Map<string, RefreshTokenRow> } = {
    rows,
    async insert(input) {
      seq += 1;
      const row = {
        id: `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
        createdAt: new Date(), lastUsedAt: new Date(),
        sessionId: input.sessionId ?? null, deviceName: input.deviceName ?? null,
        appVersion: input.appVersion ?? null, revokedAt: null, rotatedFrom: null,
        ...input,
      } as RefreshTokenRow;
      rows.set(row.id, row);
      return row;
    },
    async findByHash(hash) {
      for (const row of rows.values()) {
        if (row.tokenHash === hash) return { ...row };
      }
      return null;
    },
    async touchLastUsed(id) {
      const row = rows.get(id);
      if (row) row.lastUsedAt = new Date();
    },
    async revoke(id) {
      const row = rows.get(id);
      if (row && !row.revokedAt) row.revokedAt = new Date();
    },
    async revokeFamily(userId, deviceId) {
      let count = 0;
      for (const row of rows.values()) {
        if (row.userId === userId && row.deviceId === deviceId && !row.revokedAt) {
          row.revokedAt = new Date();
          count += 1;
        }
      }
      return count;
    },
    async revokeAllForUser(userId) {
      let count = 0;
      for (const row of rows.values()) {
        if (row.userId === userId && !row.revokedAt) { row.revokedAt = new Date(); count += 1; }
      }
      return count;
    },
    async listActiveForUser(userId) {
      return [...rows.values()].filter((r) => r.userId === userId && !r.revokedAt);
    },
    async findOwned(id, userId) {
      const row = rows.get(id);
      return row && row.userId === userId ? { ...row } : null;
    },
    async markRotated(oldId, newId) {
      const old = rows.get(oldId);
      const fresh = rows.get(newId);
      if (old) { old.revokedAt = new Date(); old.rotatedFrom = oldId; }
      if (fresh) fresh.rotatedFrom = oldId;
    },
  };
  return repo;
}

const roles = { findRole: async () => "student" };
const device = { deviceId: "dev-1", platform: "ios" as const };

describe("refresh rotation + reuse detection", () => {
  let repo: ReturnType<typeof memoryRepo>;
  beforeEach(() => {
    repo = memoryRepo();
  });

  it("rotates: old token dies, new token works", async () => {
    const first = await issueTokenPair(repo, { userId: "u1", role: "student", sessionId: "s1", device });
    const rotated = await rotateRefreshToken(repo, roles, first.refreshToken);
    expect(rotated.pair.refreshToken).not.toBe(first.refreshToken);
    // Access tokens carry second-granularity iat/exp, so two issues in the
    // same second may be identical — assert the payload instead.
    const { verifyAccessToken } = await import("@/lib/auth/mobile-access");
    const checked = await verifyAccessToken(rotated.pair.accessToken);
    expect("payload" in checked && checked.payload.sub).toBe("u1");
    // Old token is now revoked.
    const oldRow = await repo.findByHash(hashRefreshToken(first.refreshToken));
    expect(oldRow?.revokedAt).not.toBeNull();
    // New token rotates fine (chain continues).
    const again = await rotateRefreshToken(repo, roles, rotated.pair.refreshToken);
    expect(again.userId).toBe("u1");
  });

  it("reuse of a rotated token revokes the whole device family", async () => {
    const first = await issueTokenPair(repo, { userId: "u1", role: "student", sessionId: "s1", device });
    const rotated = await rotateRefreshToken(repo, roles, first.refreshToken);
    // Attacker replays the stolen (already rotated) token.
    await expect(rotateRefreshToken(repo, roles, first.refreshToken)).rejects.toMatchObject({ status: 401 });
    // Family is dead: even the legitimate newest token is revoked.
    const newest = await repo.findByHash(hashRefreshToken(rotated.pair.refreshToken));
    expect(newest?.revokedAt).not.toBeNull();
    await expect(rotateRefreshToken(repo, roles, rotated.pair.refreshToken)).rejects.toMatchObject({ status: 401 });
  });

  it("unknown and expired tokens are rejected without leaking", async () => {
    await expect(rotateRefreshToken(repo, roles, newRefreshToken())).rejects.toMatchObject({ status: 401 });
    const pair = await issueTokenPair(repo, { userId: "u1", role: "student", sessionId: "s1", device });
    const row = (await repo.findByHash(hashRefreshToken(pair.refreshToken))) as RefreshTokenRow;
    repo.rows.get(row.id)!.expiresAt = new Date(Date.now() - 1000);
    await expect(rotateRefreshToken(repo, roles, pair.refreshToken)).rejects.toMatchObject({ status: 401 });
    expect(REFRESH_TOKEN_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
