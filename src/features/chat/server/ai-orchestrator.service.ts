import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { chatConversations, chatMessages } from "@/db/schema";
import { notifyChatHuman } from "@/lib/telegram/chat-bridge";
import { AnthropicChatAgent } from "./agents/anthropic";
import { ExternalAgentProvider } from "./agents";
import { buildSiteFacts } from "./agents/site-facts";
import { countAiRepliesSince, getThread } from "./chat.service";
import { getChatSettings } from "./settings.service";

function startOfUtcDay() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function persistAiReply(conversationId: string, text: string, draft: boolean) {
  const [message] = await db.transaction(async (tx) => {
    const inserted = await tx.insert(chatMessages).values({
      conversationId,
      clientId: draft ? `draft:${crypto.randomUUID()}` : crypto.randomUUID(),
      sender: "ai",
      body: text,
    }).returning();
    await tx.update(chatConversations).set({
      lastMessageAt: inserted[0].createdAt,
      ...(draft ? {} : { unreadForVisitor: sql`${chatConversations.unreadForVisitor} + 1` }),
    }).where(eq(chatConversations.id, conversationId));
    return inserted;
  });
  return message;
}

export type AiAction = "off" | "external" | "cap" | "failure" | "handoff" | "draft" | "reply";

export function decideAiAction(input: {
  enabled: boolean;
  mode: "off" | "assist" | "auto";
  provider: "anthropic" | "external";
  conversationCount: number;
  globalCount: number;
  cap: number;
  hasError: boolean;
  handoff: boolean;
  text: string;
}): AiAction {
  if (!input.enabled || input.mode === "off") return "off";
  if (input.provider === "external") return "external";
  if (input.conversationCount >= input.cap || input.globalCount >= input.cap) return "cap";
  if (input.hasError) return "failure";
  if (input.handoff || !input.text) return "handoff";
  return input.mode === "assist" ? "draft" : "reply";
}

export async function orchestrateAiReply(conversationId: string) {
  const settings = await getChatSettings();
  const thread = await getThread(conversationId);
  const { conversation } = thread;

  const dayStart = startOfUtcDay();
  const [conversationCount, globalCount] = await Promise.all([
    countAiRepliesSince(conversationId, dayStart),
    countAiRepliesSince(null, dayStart),
  ]);
  const base = {
    enabled: settings.enabled,
    mode: conversation.aiMode,
    provider: settings.aiProvider,
    conversationCount,
    globalCount,
    cap: settings.aiDailyReplyCap,
    hasError: false,
    handoff: false,
    text: "",
  };
  const initialAction = decideAiAction(base);
  if (initialAction === "off" || initialAction === "external") return;
  if (initialAction === "cap") {
    await notifyChatHuman({ conversationId, title: "AI kunlik limiti", detail: "Kunlik AI javoblar limiti tugadi. Suhbat inson yordamiga yo'naltirildi." });
    return;
  }

  const provider = new AnthropicChatAgent(process.env.ANTHROPIC_API_KEY, settings.aiModel);
  const result = await provider.generateReply({
    history: thread.messages.map((message) => ({ sender: message.sender, body: message.body })),
    siteFacts: buildSiteFacts(),
    persona: settings.aiPersona,
  });
  const action = decideAiAction({ ...base, hasError: Boolean(result.error), handoff: result.handoff, text: result.text });
  if (action === "failure") {
    await db.update(chatConversations).set({ aiMode: "off" })
      .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.aiMode, conversation.aiMode)));
  }
  if (action === "failure" || action === "handoff") {
    await notifyChatHuman({
      conversationId,
      title: result.error === "missing_api_key" ? "AI kaliti yo'q" : "AI inson yordamiga yo'naltirdi",
      detail: result.error
        ? "AI provayder ishlamadi. AI vaqtincha o'chirildi; mehmon xabari saqlangan."
        : "Mehmon savoliga ishonchli javob topilmadi. Inbox'da inson javobi kutilmoqda.",
    });
    return;
  }
  await persistAiReply(conversationId, result.text, action === "draft");
}
