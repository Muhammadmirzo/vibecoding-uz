import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Central domain-error → HTTP mapping (W4-ARCH).
 * Route handlers are thin: parse → auth → service → map errors.
 * Services throw {@link ServiceError} (or legacy `{ code }` errors);
 * handlers convert with {@link errorResponse}. No per-route status tables.
 */
export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

/** HTTP status for legacy service error codes (thrown by pre-W4 services). */
export const STATUS_BY_CODE: Record<string, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  PROVIDER_UNAVAILABLE: 503,
  BAD_PRICE: 422,
  BAD_TARGET: 422,
  NOT_PAID: 422,
  INELIGIBLE: 422,
  EXCEEDS_BALANCE: 422,
  BELOW_MINIMUM: 422,
  INVALID_AMOUNT: 400,
  VALIDATION: 400,
};

function statusOf(error: object): number {
  const candidate = error as { status?: unknown; code?: unknown };
  if (typeof candidate.status === "number" && Number.isInteger(candidate.status)) {
    return candidate.status;
  }
  if (typeof candidate.code === "string" && candidate.code in STATUS_BY_CODE) {
    return STATUS_BY_CODE[candidate.code];
  }
  return 500;
}

function codeOf(error: object): string {
  const candidate = error as { code?: unknown };
  return typeof candidate.code === "string" && candidate.code.length > 0 ? candidate.code : "internal_error";
}

const DATABASE_ERROR_CODES = new Set([
  "ECONNREFUSED", "ECONNRESET", "ENOTFOUND", "ETIMEDOUT", "EAI_AGAIN",
  "08000", "08001", "08003", "08004", "08006", "08007", "08P01", "53300", "57P01",
]);

/** Recognises PostgreSQL/connectivity failures so public pages never expose a generic 500. */
export function isDatabaseUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown; name?: unknown };
  if (typeof candidate.code === "string" && DATABASE_ERROR_CODES.has(candidate.code)) return true;
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";
  return message.includes("connection terminated") || message.includes("connection refused") ||
    message.includes("connection lost") || message.includes("connect timeout") ||
    message.includes("the database system is") || message.includes("timeout exceeded");
}

const RECOVERY_MESSAGE = "Texnik xizmat vaqtincha ishlamayapti. Ma'lumotlaringiz saqlangan; qisqa vaqt ichida qayta urinib ko'ring.";

/**
 * Converts any thrown error into a JSON error response.
 * Zod validation failures → 400, known domain codes → mapped status,
 * everything else → 500 with a generic code (message is kept for
 * debuggability but never leaks secrets — services must not put
 * secrets in error messages).
 */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "validation_error", details: error.flatten() },
      { status: 400 },
    );
  }
  if (typeof error === "object" && error !== null) {
    const databaseUnavailable = isDatabaseUnavailable(error);
    const rateLimitUnavailable = error instanceof Error && /rate limit service/i.test(error.message);
    const status = databaseUnavailable || rateLimitUnavailable ? 503 : statusOf(error);
    const code = databaseUnavailable ? "database_unavailable" : rateLimitUnavailable ? "rate_limit_unavailable" : codeOf(error);
    const message = databaseUnavailable || rateLimitUnavailable ? RECOVERY_MESSAGE : error instanceof Error ? error.message : code;
    const retryable = status === 503 || status === 429 || status === 408;
    if (status >= 500) {
      console.error(`[api] ${code}:`, error);
    }
    return NextResponse.json({ error: code, message, retryable }, { status });
  }
  console.error("[api] non-error thrown:", error);
  return NextResponse.json({ error: "internal_error", message: RECOVERY_MESSAGE, retryable: false }, { status: 500 });
}

/** Success envelope helper (keeps list routes consistent). */
export function okResponse<T extends Record<string, unknown>>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
