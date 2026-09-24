import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http/errors";

/**
 * API v1 envelope (docs/waves/API-CONTRACT.md) shared by web, admin, MCP and mobile.
 * Success: { data, meta? } · Error: { error: { code, message, details? } }.
 */
export interface V1Meta {
  nextCursor?: string | null;
  total?: number;
}

export function ok<T>(data: T, meta?: V1Meta, init?: ResponseInit): NextResponse {
  return NextResponse.json(meta ? { data, meta } : { data }, { status: 200, ...init });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}

const CODE_BY_STATUS: Record<number, string> = {
  400: "validation_error", 401: "unauthorized", 403: "forbidden", 404: "not_found",
  409: "conflict", 422: "unprocessable", 429: "rate_limited", 503: "service_unavailable",
};
const FALLBACK_MESSAGE = "Kutilmagan xatolik yuz berdi. Qayta urinib ko'ring.";

/**
 * Converts a legacy error Response (from `errorResponse`, an auth gate or a rate-limit
 * response) into the v1 error envelope, keeping its status and Retry-After header.
 */
export async function toV1Error(response: Response): Promise<NextResponse> {
  let body: Record<string, unknown> = {};
  try {
    body = (await response.clone().json()) as Record<string, unknown>;
  } catch {
    // non-JSON body: fall back to status-derived code
  }
  const legacyError = typeof body.error === "string" ? body.error : undefined;
  const legacyMessage = typeof body.message === "string" ? body.message : undefined;
  // Legacy gates put the human message in `error`; errorResponse puts a code there and the text in `message`.
  const code = legacyMessage && legacyError ? legacyError : CODE_BY_STATUS[response.status] ?? "internal_error";
  const message = legacyMessage ?? legacyError ?? FALLBACK_MESSAGE;
  const error: Record<string, unknown> = { code, message };
  if (body.details !== undefined) error.details = body.details;
  const headers = new Headers();
  const retryAfter = response.headers.get("Retry-After");
  if (retryAfter) headers.set("Retry-After", retryAfter);
  return NextResponse.json({ error }, { status: response.status, headers });
}

/** Maps any thrown error (or a returned legacy error Response) to the v1 envelope. */
export async function fail(error: unknown): Promise<NextResponse> {
  return toV1Error(error instanceof Response ? error : errorResponse(error));
}
