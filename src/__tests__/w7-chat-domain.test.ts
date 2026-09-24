import { describe, expect, it } from "vitest";
import { chatSettingsSchema, sendMessageSchema } from "@/features/chat/contracts";
import { isOfficeOpen, minutesInTimezone } from "@/features/chat/domain/office-hours";
import { decideAiAction } from "@/features/chat/server/ai-orchestrator.service";

const baseAction = {
  enabled: true,
  mode: "auto" as const,
  provider: "anthropic" as const,
  conversationCount: 0,
  globalCount: 0,
  cap: 40,
  hasError: false,
  handoff: false,
  text: "Salom",
};

describe("W7 chat domain contracts", () => {
  it("uses safe settings and an honest Tashkent timezone", () => {
    const settings = chatSettingsSchema.parse({});
    expect(settings.officeHours.tz).toBe("Asia/Tashkent");
    expect(settings.replyTimeMinutes).toBe(10);
    expect(settings.aiDailyReplyCap).toBeGreaterThan(0);
  });

  it("rejects messages over 2000 characters and duplicate contact methods", () => {
    expect(sendMessageSchema.safeParse({ clientId: crypto.randomUUID(), body: "x".repeat(2001) }).success).toBe(false);
    expect(sendMessageSchema.safeParse({ clientId: crypto.randomUUID(), body: "Salom", phone: "+998901234567", telegram: "user" }).success).toBe(false);
  });

  it("evaluates office hours in Asia/Tashkent", () => {
    const hours = { start: 9, end: 19, tz: "Asia/Tashkent" as const };
    expect(minutesInTimezone(new Date("2026-09-24T04:00:00Z"), hours.tz)).toBe(540);
    expect(isOfficeOpen(new Date("2026-09-24T04:00:00Z"), hours)).toBe(true);
    expect(isOfficeOpen(new Date("2026-09-24T14:00:00Z"), hours)).toBe(false);
  });
});

describe("AI orchestration policy", () => {
  it("selects assist drafts, auto replies, external waiting and handoff", () => {
    expect(decideAiAction({ ...baseAction, mode: "assist" })).toBe("draft");
    expect(decideAiAction(baseAction)).toBe("reply");
    expect(decideAiAction({ ...baseAction, provider: "external" })).toBe("external");
    expect(decideAiAction({ ...baseAction, handoff: true })).toBe("handoff");
  });

  it("silently disables on provider failure and enforces persisted caps", () => {
    expect(decideAiAction({ ...baseAction, hasError: true })).toBe("failure");
    expect(decideAiAction({ ...baseAction, conversationCount: 40 })).toBe("cap");
    expect(decideAiAction({ ...baseAction, globalCount: 40 })).toBe("cap");
    expect(decideAiAction({ ...baseAction, mode: "off" })).toBe("off");
  });
});
