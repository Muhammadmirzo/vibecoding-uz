import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";

export const CHAT_COOKIE = "naqsh_chat_visitor";
export function createVisitorToken(): string { return randomBytes(32).toString("base64url"); }
export function hashVisitorToken(token: string): string { return createHash("sha256").update(token).digest("hex"); }
export async function getOrCreateVisitorToken(): Promise<{ token: string; isNew: boolean }> {
  const store = await cookies(); const existing = store.get(CHAT_COOKIE)?.value;
  if (existing) return { token: existing, isNew: false };
  const token = createVisitorToken();
  store.set(CHAT_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return { token, isNew: true };
}
export function visitorTokenFromRequest(request: Request): string | null { return request.headers.get("x-visitor-token") || null; }
/** Reads the visitor token without minting one (read-only endpoints). */
export async function readVisitorToken(): Promise<string | null> {
  return (await cookies()).get(CHAT_COOKIE)?.value || null;
}
