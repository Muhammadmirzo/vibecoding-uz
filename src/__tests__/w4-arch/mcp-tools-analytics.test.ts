/**
 * Unit tests for the read-only analytics MCP tools: auth gate, input
 * validation (dates, range, limit) and wiring to the analytics services,
 * using an in-memory AnalyticsRepository (no DB). The real-DB round trip
 * lives in mcp-analytics-db.test.ts.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { MCP_AUTH_ENV_VAR } from "../../../mcp-server/auth";
import { dispatchTool, listToolDefs } from "../../../mcp-server/server";
import { handle as overview } from "../../../mcp-server/tools/analytics-overview";
import { somToMoney } from "../../../mcp-server/tools/analytics-shared";
import { handle as funnel } from "../../../mcp-server/tools/conversion-funnel";
import { handle as landing } from "../../../mcp-server/tools/landing-pages";
import { handle as sales } from "../../../mcp-server/tools/sales-report";
import { handle as students } from "../../../mcp-server/tools/student-progress";
import { handle as traffic } from "../../../mcp-server/tools/traffic-sources";
import type { McpToolResult } from "../../../mcp-server/types";
import { EMPTY_OVERVIEW, type AnalyticsRepository } from "@/features/analytics/server/analytics.repository";
import type { AnalyticsRange } from "@/features/analytics/domain/report-types";

const TOKEN = "test-token-analytics";
const ANALYTICS_TOOLS = [
  "get_analytics_overview",
  "get_traffic_sources",
  "get_conversion_funnel",
  "get_landing_page_performance",
  "get_sales_report",
  "get_student_progress_report",
];

beforeEach(() => {
  process.env[MCP_AUTH_ENV_VAR] = TOKEN;
});

function authed(args: Record<string, unknown>): Record<string, unknown> {
  return { ...args, authToken: TOKEN };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function payload(result: McpToolResult): Record<string, unknown> {
  const parsed: unknown = JSON.parse(result.content[0]?.text ?? "{}");
  if (!isRecord(parsed)) throw new Error("tool payload is not an object");
  return parsed;
}

function field(value: unknown, key: string): unknown {
  if (!isRecord(value)) throw new Error(`expected object holding ${key}`);
  return value[key];
}

const seen: AnalyticsRange[] = [];
const sources = Array.from({ length: 30 }, (_, i) => ({ source: `s${i}`, visitors: 100 - i, leads: i === 3 ? 40 : 1, conversionRate: 1 }));
const fakeRepo: AnalyticsRepository = {
  async overviewTotals(range) {
    seen.push(range);
    return { current: { ...EMPTY_OVERVIEW, visitors: 200, leads: 20, revenueUzs: 2_490_000 }, previous: { ...EMPTY_OVERVIEW, visitors: 100, leads: 20 } };
  },
  async timeseries() { return []; },
  async sources() { return sources; },
  async campaigns() { return [{ campaign: "kuz", visitors: 10, leads: 2, revenueUzs: 1_000 }]; },
  async landingPages() { return [{ path: "/", visitors: 50, leads: 5, conversionRate: 10 }]; },
  async behaviour() {
    return { topPages: [], entryPages: [{ path: "/", views: 0, visitors: 7, exits: 0, exitRate: 0, averageEngagedMs: 0, averageScrollDepth: 0 }], exitPages: [], averageEngagedMs: 12_400, averageScrollDepth: 55 };
  },
  async funnel() {
    const step = (key: string, count: number) => ({ key, label: key, count, conversionFromPrevious: 0, conversionFromVisit: 0 });
    return [step("visit", 100), step("diagnostic", 50), step("lead", 10), step("signup", 8), step("checkout", 4), step("paid", 2)];
  },
  async students() {
    return { activeStudents: 3, newEnrollments: 2, courses: [], homeworkSubmissionRate: 12.345, cohortAttendanceRate: 50 };
  },
  async sales() {
    return {
      revenueByDay: [{ date: "2026-09-01", revenueUzs: 1_000_000, orders: 1 }, { date: "2026-09-02", revenueUzs: 3_000_000, orders: 2 }],
      revenueByCourse: [{ courseId: "c1", courseTitle: "AI", revenueUzs: 4_000_000, orders: 3 }],
      averageOrderUzs: 4_000_000 / 3, refundsCount: 0, refundsUzs: 0, topReferrers: [],
    };
  },
  async dimensions() { return []; },
  async realtime() { return 0; },
};
const deps = { repository: fakeRepo };

describe("analytics MCP tools: registry + auth", () => {
  it("registers all six analytics tools as read-only", () => {
    const defs = listToolDefs().filter((def) => ANALYTICS_TOOLS.includes(def.name));
    expect(defs.map((def) => def.name).sort()).toEqual([...ANALYTICS_TOOLS].sort());
    for (const def of defs) {
      expect(def.annotations?.readOnlyHint).toBe(true);
      expect(def.inputSchema.properties).toHaveProperty("from");
      expect(def.inputSchema.properties).toHaveProperty("authToken");
    }
  });

  it("rejects missing/wrong tokens on every analytics tool (via dispatch)", async () => {
    for (const name of ANALYTICS_TOOLS) {
      expect(payload(await dispatchTool(name, {})).error).toBe("unauthorized");
      expect(payload(await dispatchTool(name, { authToken: "nope" })).error).toBe("unauthorized");
    }
  });
});

describe("analytics MCP tools: input validation", () => {
  it("rejects bad dates, reversed ranges, >366 days and bad limits", async () => {
    const bad = [
      { from: "yesterday" },
      { to: "2026-13-01" },
      { from: "2026-09-10", to: "2026-09-01" },
      { from: "2024-01-01", to: "2026-01-01" },
    ];
    for (const args of bad) {
      expect(payload(await overview(authed(args), deps)).error).toBe("invalid_input");
    }
    expect(payload(await traffic(authed({ limit: 0 }), deps)).error).toBe("invalid_input");
    expect(payload(await traffic(authed({ limit: 51 }), deps)).error).toBe("invalid_input");
    expect(payload(await sales(authed({ limit: 2.5 }), deps)).error).toBe("invalid_input");
  });

  it("defaults to the last 30 days and treats a date-only 'to' as inclusive", async () => {
    const dflt = payload(await funnel(authed({}), deps));
    expect(field(dflt.range, "days")).toBe(30);
    const explicit = payload(await overview(authed({ from: "2026-09-01", to: "2026-09-07" }), deps));
    expect(field(explicit.range, "from")).toBe("2026-09-01T00:00:00.000Z");
    expect(field(explicit.range, "to")).toBe("2026-09-08T00:00:00.000Z");
    expect(field(explicit.range, "days")).toBe(7);
    const exactly366 = await overview(authed({ from: "2025-09-01", to: "2026-09-01" }), deps);
    expect(exactly366.isError).toBeUndefined();
  });
});

describe("analytics MCP tools: wiring to services", () => {
  it("overview returns deltas and money as tiyin + so'm", async () => {
    const body = payload(await overview(authed({ from: "2026-08-01T00:00:00Z", to: "2026-08-31T00:00:00Z" }), deps));
    expect(body.ok).toBe(true);
    expect(field(field(body.metrics, "visitors"), "deltaPercent")).toBe(100);
    expect(field(body.revenue, "current")).toEqual({ tiyin: 249_000_000, formatted: "2 490 000 so'm" });
    expect(seen.at(-1)?.from.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  it("traffic sources honours limit and finds the top lead source", async () => {
    const body = payload(await traffic(authed({ limit: 5 }), deps));
    expect(Array.isArray(body.sources) && body.sources.length).toBe(5);
    expect(body.totalSources).toBe(30);
    expect(body.topSourceByLeads).toBe("s3");
    const campaigns = body.campaigns;
    expect(Array.isArray(campaigns) && field(campaigns[0], "revenue")).toEqual({ tiyin: 100_000, formatted: "1 000 so'm" });
  });

  it("funnel reports the biggest drop-off", async () => {
    const body = payload(await funnel(authed({}), deps));
    expect(field(body.biggestDropOff, "intoStep")).toBe("lead");
  });

  it("landing, sales and students reports return compact shapes", async () => {
    const land = payload(await landing(authed({}), deps));
    expect(field(land.engagement, "averageEngagedSeconds")).toBe(12);
    const sale = payload(await sales(authed({ limit: 1 }), deps));
    expect(field(sale.totals, "revenue")).toEqual({ tiyin: 400_000_000, formatted: "4 000 000 so'm" });
    expect(field(sale.totals, "orders")).toBe(3);
    expect(Array.isArray(sale.bestDays) && field(sale.bestDays[0], "date")).toBe("2026-09-02");
    const stud = payload(await students(authed({}), deps));
    expect(stud.homeworkSubmissionRatePct).toBe(12.3);
  });

  it("surfaces repository failures as structured errors", async () => {
    const failing = { repository: { ...fakeRepo, async funnel(): Promise<never> { throw new Error("boom"); } } };
    const body = payload(await funnel(authed({ from: "2026-01-01", to: "2026-01-02" }), failing));
    expect(body.error).toBe("query_failed");
  });

  it("somToMoney never produces negative or fractional tiyin", () => {
    expect(somToMoney(-5)).toEqual({ tiyin: 0, formatted: "0 so'm" });
    expect(somToMoney(1234.567).tiyin).toBe(123_457);
    expect(somToMoney(Number.NaN).tiyin).toBe(0);
  });
});
