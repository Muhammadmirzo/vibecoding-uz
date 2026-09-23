import { getSessionSecret } from "./constants";
import { DEFAULT_SESSION_TTL_HOURS, type SessionPayload } from "./types";

type SessionTokenInput = string | Partial<SessionPayload>;

function base64urlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(value: string): string {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

async function hmacSha256(payload: string, secret: string): Promise<Uint8Array> {
  if (!secret) throw new Error("Session signing secret cannot be empty");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

function constantTimeEqual(expected: Uint8Array, suppliedHex: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    const supplied = Number.parseInt(suppliedHex.slice(index * 2, index * 2 + 2), 16);
    difference |= expected[index] ^ supplied;
  }
  return difference === 0;
}

function normalizePayload(input: SessionTokenInput): SessionPayload {
  const source = typeof input === "string"
    ? { sessionId: input, userId: input, role: "student" }
    : input;
  const userId = source.userId || source.sessionId;
  if (!userId) throw new Error("Session token requires a userId or sessionId");
  return {
    userId,
    role: source.role || "student",
    sessionId: source.sessionId || userId,
    expiresAt: source.expiresAt ?? Date.now() + DEFAULT_SESSION_TTL_HOURS * 3_600_000,
  };
}

export async function signSessionToken(
  payloadInput: SessionTokenInput,
  secret: string = getSessionSecret()
): Promise<string> {
  const payload = base64urlEncode(JSON.stringify(normalizePayload(payloadInput)));
  const signature = await hmacSha256(payload, secret);
  const signatureHex = Array.from(signature, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${payload}.${signatureHex}`;
}

export const createSessionToken = signSessionToken;

export async function verifySessionToken(
  token: string | null | undefined,
  secret: string = getSessionSecret()
): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  try {
    const expected = await hmacSha256(payload, secret);
    if (!constantTimeEqual(expected, signature)) return null;
    const decoded: unknown = JSON.parse(base64urlDecode(payload));
    if (!decoded || typeof decoded !== "object") return null;
    const value = decoded as Record<string, unknown>;
    const userId = value.userId || value.sessionId;
    if (typeof userId !== "string" || !userId) return null;
    if (typeof value.expiresAt !== "number" || !Number.isFinite(value.expiresAt)) return null;
    if (Date.now() > value.expiresAt) return null;
    return {
      userId,
      role: typeof value.role === "string" ? value.role : "student",
      sessionId: typeof value.sessionId === "string" ? value.sessionId : userId,
      expiresAt: value.expiresAt,
    };
  } catch {
    return null;
  }
}
