export const DEFAULT_SESSION_COOKIE_NAME = "session_token";
export const SESSION_COOKIE_NAME = DEFAULT_SESSION_COOKIE_NAME;
export const DEFAULT_SESSION_TTL_HOURS = 24;

export interface SessionPayload {
  userId: string;
  role: string;
  sessionId?: string;
  expiresAt?: number;
}

export interface SessionRecord {
  id: string;
  userId: string;
  role: string;
  device?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

export type SessionValidationError =
  | "MISSING_TOKEN"
  | "INVALID_SIGNATURE"
  | "EXPIRED_SESSION"
  | "SESSION_NOT_FOUND";

export interface SessionValidationResult {
  valid: boolean;
  error?: SessionValidationError;
  session?: SessionRecord;
}
