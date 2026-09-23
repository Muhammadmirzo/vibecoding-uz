export interface RateLimitConfig {
  /** Maximum number of allowed requests within windowSeconds */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Prefix for cache keys (e.g. 'otp', 'login', 'quiz') */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSec: number;
}

// Preset configurations as specified in §12 & Prompt:
export const PRESETS = {
  /** OTP requests: max 3 requests per 5 minutes (300s) */
  OTP: { limit: 3, windowSeconds: 300, prefix: "otp" },
  /** Login attempts: max 5 attempts per 15 minutes (900s) */
  LOGIN: { limit: 5, windowSeconds: 900, prefix: "login" },
  /** Quiz form submissions: max 5 submissions per 10 minutes (600s) */
  QUIZ: { limit: 5, windowSeconds: 600, prefix: "quiz" },
} as const;
