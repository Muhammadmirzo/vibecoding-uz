import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Shared rate-limit buckets (W10). Upstash bo'lmaganda Vercel serverless
 * instansiyalari orasida umumiy limit shu jadvalda saqlanadi.
 * `key` = prefix:SHA-256(identifier) — xom IP hech qachon saqlanmaydi.
 */
export const rateLimitBuckets = pgTable("rate_limit_buckets", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(1),
});

export type RateLimitBucket = typeof rateLimitBuckets.$inferSelect;
