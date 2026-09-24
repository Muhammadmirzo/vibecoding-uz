import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const ACCESS_TTL_MS = 60 * 60 * 1000;
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const AUTH_CODE_TTL_MS = 5 * 60 * 1000;

export function randomOpaqueToken(prefix: "at" | "rt" | "code" | "pat"): string {
  return `nq_${prefix}_${randomBytes(32).toString("base64url")}`;
}

export function tokenHash(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function safeHashEqual(value: string, hash: string): boolean {
  const a = Buffer.from(tokenHash(value), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function safeDigestEqual(value: string, expectedDigest: string): boolean {
  const a = Buffer.from(value, "utf8");
  const b = Buffer.from(expectedDigest, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function pkceS256(verifier: string): string {
  return createHash("sha256").update(verifier, "ascii").digest("base64url");
}
