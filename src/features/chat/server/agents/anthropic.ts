import Anthropic from "@anthropic-ai/sdk";
import type { ChatAgentContext, ChatAgentProvider, ChatAgentResult } from "./index";

const PERSON_REQUEST = /\b(odam|inson|admin|operator|mentor|human|person)\b/i;

/** Last 20 non-empty messages; the API needs the conversation to start with a user turn. */
function toApiMessages(history: ChatAgentContext["history"]) {
  const mapped = history.slice(-20).filter((message) => message.body.trim()).map((message) => ({
    role: message.sender === "admin" || message.sender === "ai" ? "assistant" as const : "user" as const,
    content: message.body,
  }));
  const firstUser = mapped.findIndex((message) => message.role === "user");
  return firstUser === -1 ? [] : mapped.slice(firstUser);
}

export class AnthropicChatAgent implements ChatAgentProvider {
  readonly id = "anthropic";
  constructor(private readonly apiKey: string | undefined, private readonly model: string) {}

  async generateReply(ctx: ChatAgentContext): Promise<ChatAgentResult> {
    if (!this.apiKey) return { text: "", handoff: true, error: "missing_api_key" };
    const latest = ctx.history.at(-1)?.body || "";
    if (PERSON_REQUEST.test(latest)) return { text: "", handoff: true };
    try {
      const client = new Anthropic({ apiKey: this.apiKey, timeout: 8_000, maxRetries: 1 });
      const response = await client.messages.create({
        model: this.model,
        max_tokens: 600,
        system: [
          "You are Naqsh support. Answer only from SITE FACTS.",
          "Never invent prices, dates, discounts, guarantees, or claims.",
          "Answer in the visitor's language, Uzbek Latin by default.",
          "Keep it short, friendly and actionable.",
          "If facts are insufficient, return exactly [HANDOFF] and nothing else.",
          "If the visitor asks for a person, return exactly [HANDOFF] and nothing else.",
          `Persona: ${ctx.persona}`,
          `SITE FACTS:\n${ctx.siteFacts}`,
        ].join("\n"),
        messages: toApiMessages(ctx.history),
      });
      const text = response.content.find((part) => part.type === "text")?.text?.trim() || "";
      if (!text || text === "[HANDOFF]") return { text: "", handoff: true };
      return { text, handoff: false };
    } catch (error) {
      return { text: "", handoff: true, error: error instanceof Error ? error.message : "provider_error" };
    }
  }
}
