import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { ServiceError } from "@/lib/http/errors";
import { signAccessToken } from "@/lib/auth/mobile-access";
import type { RefreshTokenRepository, RefreshTokenRow } from "./refresh-token.repository";

export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const REFRESH_PREFIX = "mrt_";

export interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  platform: "ios" | "android" | "web";
  appVersion?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sameHash(expectedHash: string, token: string): boolean {
  const a = Buffer.from(expectedHash, "hex");
  const b = Buffer.from(hashRefreshToken(token), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function newRefreshToken(): string {
  return `${REFRESH_PREFIX}${randomBytes(32).toString("base64url")}`;
}

function active(row: RefreshTokenRow): boolean {
  if (row.revokedAt) return false;
  return row.expiresAt.getTime() > Date.now();
}

/** Issues a fresh pair bound to an existing web session row (sid). */
export async function issueTokenPair(
  repo: RefreshTokenRepository,
  input: { userId: string; role: string; sessionId: string; device: DeviceInfo },
): Promise<TokenPair> {
  const refreshToken = newRefreshToken();
  await repo.insert({
    userId: input.userId,
    sessionId: input.sessionId,
    tokenHash: hashRefreshToken(refreshToken),
    deviceId: input.device.deviceId,
    deviceName: input.device.deviceName,
    platform: input.device.platform,
    appVersion: input.device.appVersion,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    lastUsedAt: new Date(),
    revokedAt: null,
    rotatedFrom: null,
  });
  const accessToken = await signAccessToken({ userId: input.userId, role: input.role, sessionId: input.sessionId });
  return { accessToken, refreshToken, tokenType: "Bearer", expiresIn: 900 };
}

export type RotateOutcome = { pair: TokenPair; userId: string; role: string; sessionId: string };

/**
 * Rotates a refresh token. Reuse of an already-rotated token means theft:
 * the whole device family is revoked (all sessions on that device die).
 */
export async function rotateRefreshToken(
  repo: RefreshTokenRepository,
  roles: { findRole(userId: string): Promise<string | null> },
  presented: string,
): Promise<RotateOutcome> {
  const row = await repo.findByHash(hashRefreshToken(presented));
  // Unknown hash: compare nothing, reveal nothing.
  if (!row || !sameHash(row.tokenHash, presented)) {
    throw new ServiceError("INVALID_TOKEN", "Yangilash tokeni yaroqsiz", 401);
  }
  if (row.revokedAt) {
    await repo.revokeFamily(row.userId, row.deviceId);
    console.warn("[mobile-auth] refresh reuse detected", { tokenId: row.id, userId: row.userId, deviceId: row.deviceId });
    throw new ServiceError("TOKEN_REUSED", "Token qayta ishlatildi. Xavfsizlik uchun barcha sessiyalar yopildi.", 401);
  }
  if (!active(row)) {
    throw new ServiceError("TOKEN_EXPIRED", "Yangilash tokeni muddati tugagan. Qayta kiring.", 401);
  }
  const role = await roles.findRole(row.userId);
  if (!role || !row.sessionId) {
    await repo.revoke(row.id);
    throw new ServiceError("INVALID_TOKEN", "Sessiya topilmadi. Qayta kiring.", 401);
  }
  const pair = await issueTokenPair(repo, {
    userId: row.userId, role, sessionId: row.sessionId,
    device: {
      deviceId: row.deviceId, deviceName: row.deviceName ?? undefined,
      platform: (row.platform as DeviceInfo["platform"]) ?? "android", appVersion: row.appVersion ?? undefined,
    },
  });
  const fresh = await repo.findByHash(hashRefreshToken(pair.refreshToken));
  if (fresh) await repo.markRotated(row.id, fresh.id);
  else await repo.revoke(row.id);
  if (fresh) await repo.touchLastUsed(fresh.id).catch(() => undefined);
  return { pair, userId: row.userId, role, sessionId: row.sessionId };
}
