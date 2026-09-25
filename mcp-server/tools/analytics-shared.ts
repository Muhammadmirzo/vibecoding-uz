/**
 * Shared plumbing for the read-only analytics MCP tools. They reuse the
 * first-party analytics services (src/features/analytics/server/*) that
 * power /admin/analytics — no SQL lives here. The repository is loaded
 * lazily so tests with injected deps never touch a database.
 */
import type { z } from "zod";
import { formatTiyinUz, TIYIN_PER_SUM } from "../../src/features/payments/domain/money";
import type { AnalyticsRepository } from "../../src/features/analytics/server/analytics.repository";
import type { AnalyticsRange } from "../../src/features/analytics/domain/report-types";
import { verifyAuthToken } from "../auth";
import {
  errorResult,
  extractAuthToken,
  successResult,
  withAuthProperty,
  type McpToolResult,
} from "../types";

export interface AnalyticsToolDeps {
  repository: AnalyticsRepository;
}

export interface ResolvedRange {
  from: Date;
  to: Date;
}

/** Money as integer tiyin (source of truth) plus a formatted so'm string. */
export interface Money {
  tiyin: number;
  formatted: string;
}

/**
 * The analytics layer reports whole so'm (payments.amount_sum is a decimal
 * so'm column; analytics_events.value_uzs is so'm). Convert to tiyin.
 */
export function somToMoney(som: number): Money {
  const tiyin = Number.isFinite(som) ? Math.max(0, Math.round(som * TIYIN_PER_SUM)) : 0;
  return { tiyin, formatted: formatTiyinUz(tiyin) };
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export const RANGE_PROPERTIES: Record<string, object> = {
  from: {
    type: "string",
    description: "Start date, ISO 'YYYY-MM-DD' or ISO datetime (default: 30 days before 'to')",
  },
  to: {
    type: "string",
    description: "End date, ISO 'YYYY-MM-DD' (inclusive day) or ISO datetime (default: now). Max range 366 days.",
  },
};

export const LIMIT_PROPERTY: Record<string, object> = {
  limit: { type: "number", description: "Max rows per list (1-50, default 10)" },
};

export function rangeProperties(withLimit: boolean): Record<string, object> {
  return withAuthProperty(withLimit ? { ...RANGE_PROPERTIES, ...LIMIT_PROPERTY } : RANGE_PROPERTIES);
}

export function toServiceRange(range: ResolvedRange): AnalyticsRange {
  return { from: range.from, to: range.to, compare: true };
}

function describeRange(range: ResolvedRange): Record<string, unknown> {
  const days = Math.round(((range.to.getTime() - range.from.getTime()) / 86_400_000) * 10) / 10;
  return { from: range.from.toISOString(), to: range.to.toISOString(), days, toIsExclusive: true };
}

async function defaultRepository(): Promise<AnalyticsRepository> {
  const mod = await import("../../src/features/analytics/server/analytics.repository");
  return mod.drizzleAnalyticsRepository;
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

type RangeSchema<T> = z.ZodType<T & { range: ResolvedRange }, z.ZodTypeDef, unknown>;

/**
 * Auth gate -> Zod parse -> report builder, wrapped in the same structured
 * result envelope every MCP tool uses. The builder receives the resolved
 * range; the payload always echoes the date range that was actually used.
 */
export async function runAnalyticsTool<T>(
  rawArgs: unknown,
  schema: RangeSchema<T>,
  deps: AnalyticsToolDeps | undefined,
  build: (repository: AnalyticsRepository, input: T & { range: ResolvedRange }) => Promise<Record<string, unknown>>
): Promise<McpToolResult> {
  if (!verifyAuthToken(extractAuthToken(rawArgs))) {
    return errorResult("unauthorized", { hint: "Provide a valid authToken." });
  }
  const parsed = schema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return errorResult("invalid_input", { issues: parsed.error.flatten() });
  }
  try {
    const repository = deps?.repository ?? (await defaultRepository());
    const report = await build(repository, parsed.data);
    return successResult({ ok: true, range: describeRange(parsed.data.range), ...report });
  } catch (err: unknown) {
    return errorResult("query_failed", { message: toErrorMessage(err) });
  }
}
