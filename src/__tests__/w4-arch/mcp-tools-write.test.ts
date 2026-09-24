import { beforeEach, describe, expect, it } from "vitest";
import { MCP_AUTH_ENV_VAR } from "../../../mcp-server/auth";
import { handle as handleBroadcast } from "../../../mcp-server/tools/broadcast";
import type {
  BroadcastInput,
  GradedSubmission,
  GradeSubmissionInput,
  QueuedBroadcast,
} from "../../../mcp-server/tools/db-write";
import { handle as handleHomework } from "../../../mcp-server/tools/homework";
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

describe("mcp write tools with mocked deps", () => {
  it("grade_homework grades via injected deps", async () => {
    const graded: GradedSubmission = {
      submissionId: "33333333-3333-3333-3333-333333333333",
      score: 85,
      feedback: "Yaxshi",
      status: "approved",
      submissionStatus: "approved",
      reviewedAt: new Date(0).toISOString(),
    };
    const result = await handleHomework(
      authed({
        submissionId: graded.submissionId,
        score: 85,
        feedback: "Yaxshi",
        mentorId: "44444444-4444-4444-4444-444444444444",
      }),
      {
        gradeSubmission: async (input: GradeSubmissionInput) => {
          expect(input.mentorId).toBe("44444444-4444-4444-4444-444444444444");
          expect(input.resultStatus).toBe("approved");
          return graded;
        },
      }
    );
    expect(payload(result).ok).toBe(true);
  });

  it("grade_homework reports missing submissions honestly", async () => {
    const result = await handleHomework(
      authed({
        submissionId: "55555555-5555-5555-5555-555555555555",
        score: 10,
        feedback: "Qayta ishlang",
        status: "needs_revision",
        mentorId: "44444444-4444-4444-4444-444444444444",
      }),
      { gradeSubmission: async () => null }
    );
    expect(payload(result).error).toBe("submission_not_found");
  });

  it("broadcast queues via injected deps", async () => {
    const queued: QueuedBroadcast = {
      id: "66666666-6666-6666-6666-666666666666",
      title: "Test broadcast",
      channel: "telegram",
      targetAudience: "all_users",
      recipientsCount: 7,
      status: "queued",
      createdAt: new Date(0).toISOString(),
    };
    const result = await handleBroadcast(authed({ title: "Test broadcast", messageBody: "hello world" }), {
      queueBroadcast: async (input: BroadcastInput) => {
        expect(input.targetAudience).toBe("all_users");
        return queued;
      },
    });
    const body = payload(result);
    expect(body.ok).toBe(true);
    expect(body.deliveryStatus).toBe("queued_not_sent");
  });

  it("broadcast requires cohortId for cohort_students and maps cohort errors", async () => {
    const missing = payload(
      await handleBroadcast(
        authed({ title: "Test broadcast", messageBody: "hello world", targetAudience: "cohort_students" })
      )
    );
    expect(missing.error).toBe("invalid_input");
    const notFound = payload(
      await handleBroadcast(
        authed({
          title: "Test broadcast",
          messageBody: "hello world",
          targetAudience: "cohort_students",
          cohortId: "77777777-7777-7777-7777-777777777777",
        }),
        {
          queueBroadcast: async () => {
            throw new Error("cohort_not_found");
          },
        }
      )
    );
    expect(notFound.error).toBe("cohort_not_found");
  });
});

describe("mcp honest limitations", () => {
  it("grade_homework refuses to grade without a mentor", async () => {
    const result = await handleHomework(authed({ submissionId: "s", score: 80, feedback: "good" }));
    expect(result.isError).toBe(true);
    expect(payload(result).error).toBe("mentor_required");
  });

  it("promocode returns honestly-unsupported instead of fake codes", async () => {
    const result = await handlePromocode(
      authed({ code: "VIBE2026", discountType: "percentage", discountValue: 15 })
    );
    expect(result.isError).toBe(true);
    const body = payload(result);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("promocodes_not_supported");
  });
});
