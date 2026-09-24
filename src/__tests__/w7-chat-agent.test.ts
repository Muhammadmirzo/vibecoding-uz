import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class AnthropicMock {
    messages = { create: mocks.create };
  },
}));

import { AnthropicChatAgent } from "@/features/chat/server/agents/anthropic";
import { buildSiteFacts } from "@/features/chat/server/agents/site-facts";

const context = {
  history: Array.from({ length: 25 }, (_, index) => ({ sender: "visitor" as const, body: `x${index}` })),
  siteFacts: buildSiteFacts(),
  persona: "Samimiy yordamchi",
};

describe("AnthropicChatAgent", () => {
  beforeEach(() => { mocks.create.mockReset(); delete process.env.ANTHROPIC_API_KEY; });

  it("hands off without a key and never calls the provider", async () => {
    const result = await new AnthropicChatAgent(undefined, "model").generateReply(context);
    expect(result).toEqual({ text: "", handoff: true, error: "missing_api_key" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("grounds, caps history at 20 and limits output to 600 tokens", async () => {
    mocks.create.mockResolvedValue({ content: [{ type: "text", text: "Kurs narxi 550 000 so'm." }] });
    const result = await new AnthropicChatAgent("secret", "configured-model").generateReply(context);
    expect(result).toEqual({ text: "Kurs narxi 550 000 so'm.", handoff: false });
    const request = mocks.create.mock.calls[0][0];
    expect(request.model).toBe("configured-model");
    expect(request.max_tokens).toBe(600);
    expect(request.messages).toHaveLength(20);
    expect(request.system).toContain("550 000 so'm");
  });

  it("hands off person requests and provider failures", async () => {
    const person = await new AnthropicChatAgent("secret", "model").generateReply({ ...context, history: [{ sender: "visitor", body: "Odam bilan gaplashish kerak" }] });
    expect(person.handoff).toBe(true);
    expect(mocks.create).not.toHaveBeenCalled();
    mocks.create.mockRejectedValue(new Error("provider down"));
    const failure = await new AnthropicChatAgent("secret", "model").generateReply(context);
    expect(failure).toMatchObject({ text: "", handoff: true, error: "provider down" });
  });
});
