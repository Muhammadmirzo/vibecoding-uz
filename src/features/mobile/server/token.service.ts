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

/** A just-rotated token replayed within this window is a client retry / parallel refresh, not theft. */
export const REUSE_GRACE_MS = 30_000;

export interface RotateDeps {
  findRole(userId: string): Promise<string | null>;
  /** The backing `sessions` row must still exist — access tokens die without it. */
  sessionAlive?(sessionId: string): Promise<boolean>;
}

/**
 * Rotates a refresh token. Reuse of an already-rotated token (outside the
 * grace window) means theft: the whole device family is revoked. The old row
 * is claimed atomically, so two parallel refreshes cannot both win.
 */
export async function rotateRefreshToken(
  repo: RefreshTokenRepository,
  deps: RotateDeps,
  presented: string,
): Promise<RotateOutcome> {
  const row = await repo.findByHash(hashRefreshToken(presented));
  // Unknown hash: compare nothing, reveal nothing.
  if (!row || !sameHash(row.tokenHash, presented)) {
    throw new ServiceError("INVALID_TOKEN", "Yangilash tokeni yaroqsiz", 401);
  }
  if (row.revokedAt) {
    if (Date.now() - row.revokedAt.getTime() < REUSE_GRACE_MS) {
      throw new ServiceError("INVALID_TOKEN", "Token allaqachon yangilangan. Eng so'nggi tokendan foydalaning.", 401);
    }
    await repo.revokeFamily(row.userId, row.deviceId);
    console.warn("[mobile-auth] refresh reuse detected", { tokenId: row.id, userId: row.userId, deviceId: row.deviceId });
    throw new ServiceError("TOKEN_REUSED", "Token qayta ishlatildi. Xavfsizlik uchun barcha sessiyalar yopildi.", 401);
  }
  if (!active(row)) {
    throw new ServiceError("TOKEN_EXPIRED", "Yangilash tokeni muddati tugagan. Qayta kiring.", 401);
  }
  const role = await deps.findRole(row.userId);
  const alive = row.sessionId && (deps.sessionAlive ? await deps.sessionAlive(row.sessionId) : true);
  if (!role || !row.sessionId || !alive) {
    await repo.revoke(row.id);
    throw new ServiceError("INVALID_TOKEN", "Sessiya topilmadi. Qayta kiring.", 401);
  }
  if (!(await repo.claim(row.id))) {
    throw new ServiceError("INVALID_TOKEN", "Token allaqachon yangilangan. Eng so'nggi tokendan foydalaning.", 401);
  }
  const pair = await issueTokenPair(repo, {
    userId: row.userId, role, sessionId: row.sessionId,
    device: {
      deviceId: row.deviceId, deviceName: row.deviceName ?? undefined,
      platform: (row.platform as DeviceInfo["platform"]) ?? "android", appVersion: row.appVersion ?? undefined,
    },
  });
  const fresh = await repo.findByHash(hashRefreshToken(pair.refreshToken));
  if (fresh) await repo.markRotated(row.id, fresh.id).catch(() => undefined);
  return { pair, userId: row.userId, role, sessionId: row.sessionId };
}
