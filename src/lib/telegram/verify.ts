export const TELEGRAM_AUTH_MAX_AGE_SECONDS = 86400;

type TelegramAuthRecord = Record<string, string | number | undefined>;

function toAuthTimestamp(authDate: number | string): number | null {
  if (typeof authDate === "number" && Number.isFinite(authDate)) return authDate;
  if (typeof authDate === "string" && authDate.trim() !== "") {
    const parsed = Number(authDate);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function isFresh(authDate: number | string): boolean {
  const ts = toAuthTimestamp(authDate);
  if (ts === null) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  const age = nowSec - ts;
  return age >= 0 && age <= TELEGRAM_AUTH_MAX_AGE_SECONDS;
}

function buildDataCheckString(data: TelegramAuthRecord): string {
  return Object.keys(data)
    .filter((key) => key !== "hash" && data[key] !== undefined)
    .sort()
    .map((key) => `${key}=${String(data[key])}`)
    .join("\n");
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyTelegramAuth(
  data: TelegramAuthRecord,
  botToken: string
): Promise<boolean> {
  const hash = data["hash"];
  if (typeof hash !== "string" || hash.length === 0) return false;
  if (!botToken) return false;

  const enc = new TextEncoder();
  const secretBytes = await crypto.subtle.digest("SHA-256", enc.encode(botToken));
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const dataCheckString = buildDataCheckString(data);
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(dataCheckString));
  const computedHex = toHex(signature);
  return timingSafeEqual(computedHex, hash.toLowerCase());
}
