/**
 * broadcast_notification — records a broadcast row (status "queued") with a
 * real recipient count. It does NOT send anything: no sender worker exists,
 * so the result is honest about delivery (queued, sentAt null).
 */
import { mcpBroadcastNotificationSchema } from "../../src/lib/validations/mcp";
import { verifyAuthToken } from "../auth";
import {
  errorResult,
  extractAuthToken,
  successResult,
  withAuthProperty,
  type McpToolDef,
  type McpToolResult,
} from "../types";
import { isUuid } from "./db";
import { queueBroadcastRecord, type BroadcastInput, type QueuedBroadcast } from "./db-write";

export const TOOL_DEF: McpToolDef = {
  name: "broadcast_notification",
  description:
    "Queues (does not send) a broadcast: inserts a broadcast_notifications row with status 'queued' and a real recipient count. Requires authToken.",
  inputSchema: {
    type: "object",
    properties: withAuthProperty({
      title: { type: "string", description: "Broadcast title" },
      channel: { type: "string", description: "'telegram', 'sms', 'email', or 'all'" },
      targetAudience: { type: "string", description: "Audience segment" },
      messageBody: { type: "string", description: "Full message text" },
      cohortId: { type: "string", description: "Required when targetAudience is 'cohort_students'" },
    }),
    required: ["title", "messageBody"],
  },
  annotations: { destructiveHint: true },
};

export interface BroadcastDeps {
  queueBroadcast: (input: BroadcastInput) => Promise<QueuedBroadcast>;
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

export async function handle(rawArgs: unknown, deps?: BroadcastDeps): Promise<McpToolResult> {
  if (!verifyAuthToken(extractAuthToken(rawArgs))) {
    return errorResult("unauthorized", { hint: "Provide a valid authToken." });
  }
  const parsed = mcpBroadcastNotificationSchema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return errorResult("invalid_input", { issues: parsed.error.flatten() });
  }
  if (parsed.data.targetAudience === "cohort_students" && parsed.data.cohortId === undefined) {
    return errorResult("invalid_input", {
      message: "cohortId is required when targetAudience is 'cohort_students'.",
    });
  }
  if (parsed.data.cohortId !== undefined && !isUuid(parsed.data.cohortId)) {
    return errorResult("invalid_input", { message: "cohortId must be a UUID." });
  }
  try {
    const queueBroadcast = deps?.queueBroadcast ?? queueBroadcastRecord;
    const queued = await queueBroadcast({
      title: parsed.data.title,
      channel: parsed.data.channel,
      targetAudience: parsed.data.targetAudience,
      messageBody: parsed.data.messageBody,
      cohortId: parsed.data.cohortId,
    });
    return successResult({ ok: true, queued: true, deliveryStatus: "queued_not_sent", broadcast: queued });
  } catch (err: unknown) {
    const message = toErrorMessage(err);
    if (message === "cohort_required" || message === "cohort_not_found") {
      return errorResult(message, {
        message: "A valid cohortId is required when targetAudience is 'cohort_students'.",
      });
    }
    return errorResult("broadcast_failed", { message });
  }
}
