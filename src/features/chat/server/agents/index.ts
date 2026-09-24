export interface ChatAgentContext {
  language?: string;
  history: { sender: "visitor" | "admin" | "ai" | "system"; body: string }[];
  siteFacts: string;
  persona: string;
}

export interface ChatAgentResult {
  text: string;
  handoff: boolean;
  error?: string;
}

export interface ChatAgentProvider {
  id: string;
  generateReply(ctx: ChatAgentContext): Promise<ChatAgentResult>;
}

/** External mode intentionally waits for W8B/MCP to post an approved answer. */
export class ExternalAgentProvider implements ChatAgentProvider {
  readonly id = "external";
  async generateReply(_ctx: ChatAgentContext): Promise<ChatAgentResult> {
    return { text: "", handoff: false };
  }
}
