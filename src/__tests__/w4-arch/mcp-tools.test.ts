import { beforeEach, describe, expect, it } from "vitest";
import { MCP_AUTH_ENV_VAR } from "../../../mcp-server/auth";
import { dispatchTool, listToolDefs } from "../../../mcp-server/server";
import { handle as handleActivity } from "../../../mcp-server/tools/activity";
import { handle as handleBroadcast } from "../../../mcp-server/tools/broadcast";
import { handle as handleCohorts } from "../../../mcp-server/tools/cohorts";
import { handle as handleHomework } from "../../../mcp-server/tools/homework";
import { handle as handleKpis } from "../../../mcp-server/tools/kpis";
import { handle as handleLeads } from "../../../mcp-server/tools/leads";
import { handle as handlePromocode } from "../../../mcp-server/tools/promocode";
import type { McpToolResult } from "../../../mcp-server/types";

const TOKEN = "test-token-xyz";

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

describe("mcp tool registry", () => {
  it("exposes all thirteen tools and dispatches unknown names as errors", async () => {
    const names = listToolDefs().map((d) => d.name).sort();
    expect(names).toEqual(
      [
        "broadcast_notification",
        "generate_discount_promocode",
        "get_cohort_status",
        "get_platform_kpis",
        "get_student_activity",
        "grade_homework",
        "query_leads_pipeline",
        "get_analytics_overview",
        "get_traffic_sources",
        "get_conversion_funnel",
        "get_landing_page_performance",
        "get_sales_report",
        "get_student_progress_report",
      ].sort()
    );
    const unknown = await dispatchTool("nope", authed({}));
    expect(unknown.isError).toBe(true);
    expect(payload(unknown).error).toBe("unknown_tool");
  });
});

describe("mcp auth gate", () => {
  it("rejects calls with missing or wrong tokens", async () => {
    for (const run of [
      () => handleKpis({ period: "30d" }),
      () => handleLeads({}),
      () => handleCohorts({}),
      () => handleHomework({ submissionId: "x", score: 80, feedback: "good" }),
      () => handleBroadcast({ title: "Hi", messageBody: "hello world" }),
      () => handlePromocode({ code: "ABC", discountType: "percentage", discountValue: 10 }),
      () => handleActivity({}),
    ]) {
      const missing = payload(await run());
      expect(missing.error).toBe("unauthorized");
    }
    const wrong = payload(await handleKpis({ period: "30d", authToken: "wrong" }));
    expect(wrong.error).toBe("unauthorized");
  });
});

describe("mcp input validation", () => {
  it("rejects bad input per tool without throwing", async () => {
    expect(payload(await handleKpis(authed({ period: "yesterday" }))).error).toBe("invalid_input");
    expect(payload(await handleLeads(authed({ limit: -5 }))).error).toBe("invalid_input");
    expect(payload(await handleHomework(authed({ submissionId: "s", score: 150, feedback: "f" }))).error).toBe(
      "invalid_input"
    );
    expect(payload(await handleHomework(authed({ submissionId: "s", score: 50, feedback: "" }))).error).toBe(
      "invalid_input"
    );
    expect(payload(await handleBroadcast(authed({ title: "x" }))).error).toBe("invalid_input");
    expect(payload(await handleActivity(authed({ limit: 0 }))).error).toBe("invalid_input");
    expect(payload(await handleCohorts(authed({ cohortId: "not-a-uuid" }))).error).toBe("invalid_input");
    expect(payload(await handleActivity(authed({ studentId: "nope" }))).error).toBe("invalid_input");
  });
});
