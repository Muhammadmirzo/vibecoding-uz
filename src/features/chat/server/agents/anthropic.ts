import Anthropic from "@anthropic-ai/sdk";
import type { ChatAgentContext, ChatAgentProvider } from "./index";

export class AnthropicChatAgent implements ChatAgentProvider {
  readonly id = "anthropic";
  constructor(private readonly apiKey: string | undefined, private readonly model: string) {}
  async generateReply(ctx: ChatAgentContext): Promise<{ text: string; handoff: boolean }> {
    if (!this.apiKey) return { text: "", handoff: true };
    try {
      const client = new Anthropic({ apiKey: this.apiKey, timeout: 8_000, maxRetries: 1 });
      const response = await client.messages.create({ model: this.model, max_tokens: 600, system: `You are Naqsh support. Answer only from SITE FACTS. Never invent prices, dates, discounts or guarantees. Keep answers short and friendly in the visitor's language. If facts are insufficient or the visitor asks for a person, set handoff true.\n\n${ctx.persona}\n\nSITE FACTS:\n${ctx.siteFacts}`, messages: ctx.history.slice(-20).map((m) => ({ role: m.sender === "admin" || m.sender === "ai" ? "assistant" as const : "user" as const, content: m.body })) });
      const text = response.content.find((part) => part.type === "text")?.text || "";
      return { text: text.trim(), handoff: /human|operator|insan|odam|admin/i.test(text) };
    } catch { return { text: "", handoff: true }; }
  }
}
