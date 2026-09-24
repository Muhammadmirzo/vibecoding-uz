export interface ChatAgentContext {
  language?: string;
  history: { sender: "visitor" | "admin" | "ai" | "system"; body: string }[];
  siteFacts: string;
  persona: string;
}
export interface ChatAgentProvider {
  id: string;
  generateReply(ctx: ChatAgentContext): Promise<{ text: string; handoff: boolean }>;
}
export class ExternalAgentProvider implements ChatAgentProvider {
  readonly id = "external";
  async generateReply(_ctx: ChatAgentContext): Promise<{ text: string; handoff: boolean }> { return { text: "", handoff: true }; }
}
