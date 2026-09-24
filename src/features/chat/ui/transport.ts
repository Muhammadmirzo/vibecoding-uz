import { chatBootstrapSchema, chatMessagesResponseSchema, chatMessageSchema, type ChatConversationDto, type ChatMessageDto, type ChatSettingsInput, type SendMessageInput } from "../contracts";

interface BootstrapData {
  conversation: ChatConversationDto | null;
  settings: ChatSettingsInput;
}

export interface ChatTransport {
  bootstrap(): Promise<BootstrapData>;
  messages(after?: string): Promise<{ conversation: ChatConversationDto | null; messages: ChatMessageDto[]; nextCursor: string | null }>;
  send(input: SendMessageInput): Promise<ChatMessageDto>;
  markRead(): Promise<void>;
  open(sourcePath: string): Promise<void>;
}

async function json(response: Response): Promise<unknown> {
  const payload: unknown = await response.json();
  if (!response.ok) throw new Error("chat_unavailable");
  return payload;
}

function data(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || !("data" in payload)) throw new Error("chat_invalid_response");
  return (payload as { data: unknown }).data;
}

export const httpChatTransport: ChatTransport = {
  async bootstrap() {
    const payload = await json(await fetch("/api/v1/chat", { credentials: "same-origin" }));
    return chatBootstrapSchema.parse(data(payload));
  },
  async messages(after) {
    const query = after ? `?after=${encodeURIComponent(after)}` : "";
    const payload = await json(await fetch(`/api/v1/chat/messages${query}`, { credentials: "same-origin" }));
    return chatMessagesResponseSchema.parse(data(payload));
  },
  async send(input) {
    const payload = await json(await fetch("/api/v1/chat/messages", {
      method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }));
    return chatMessageSchema.parse((data(payload) as { message: unknown }).message);
  },
  async markRead() {
    await json(await fetch("/api/v1/chat/read", { method: "POST", credentials: "same-origin" }));
  },
  async open(sourcePath) {
    await json(await fetch("/api/v1/chat/open", {
      method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" },
      body: JSON.stringify({ sourcePath }),
    }));
  },
};
