import { beforeEach, describe, expect, it } from "vitest";
import { MCP_AUTH_ENV_VAR } from "../../../mcp-server/auth";
import { handle as handleActivity } from "../../../mcp-server/tools/activity";
import { handle as handleCohorts } from "../../../mcp-server/tools/cohorts";
import type { CohortRow } from "../../../mcp-server/tools/db";
import { handle as handleKpis } from "../../../mcp-server/tools/kpis";
import { handle as handleLeads } from "../../../mcp-server/tools/leads";
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

function fakeKpis() {
  return Promise.resolve({
    totalLeads: 3,
    activeStudents: 2,
    pendingHomework: 1,
    paidPayments: 1,
    paidRevenueTiyin: 100000,
    totalCohorts: 1,
  });
}

describe("mcp read tools with mocked deps", () => {
  it("kpis returns aggregates", async () => {
    const result = await handleKpis(authed({ period: "7d" }), { getKpis: async () => fakeKpis() });
    const body = payload(result);
    expect(body.ok).toBe(true);
    expect(body.period).toBe("7d");
  });

  it("leads returns rows", async () => {
    const result = await handleLeads(authed({ status: "new", limit: 5 }), {
      listLeads: async (status: string, limit: number) => {
        expect(status).toBe("new");
        expect(limit).toBe(5);
        return [
          {
            id: "lead-1",
            name: "Test User",
            phone: "+998901112233",
            telegram: null,
            source: "quiz",
            status: "new",
            createdAt: new Date(0).toISOString(),
          },
        ];
      },
    });
    const body = payload(result);
    expect(body.ok).toBe(true);
    expect(body.count).toBe(1);
  });

  it("cohorts returns rows", async () => {
    const row: CohortRow = {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Cohort 1",
      courseTitle: "Course",
      startsAt: new Date(0).toISOString(),
      seats: 30,
      status: "active",
      priceSum: "2990000.00",
      earlyPriceSum: null,
      earlyDeadline: null,
      enrolled: 5,
      remaining: 25,
    };
    const result = await handleCohorts(authed({}), {
      listCohorts: async (cohortId: string | undefined) => {
        expect(cohortId).toBeUndefined();
        return [row];
      },
    });
    expect(payload(result).ok).toBe(true);
  });

  it("activity returns rows", async () => {
    const result = await handleActivity(authed({ status: "all" }), {
      getActivity: async () => [
        {
          studentId: "22222222-2222-2222-2222-222222222222",
          fullName: "Student One",
          phone: "+998901112233",
          email: null,
          cohortId: null,
          cohortName: null,
          enrollmentStatus: null,
          lastActiveAt: null,
          completedLessons: 0,
          submittedHomework: 0,
          approvedHomework: 0,
          pendingHomework: 0,
          status: "inactive",
        },
      ],
    });
    const body = payload(result);
    expect(body.ok).toBe(true);
    expect(body.count).toBe(1);
  });
});
