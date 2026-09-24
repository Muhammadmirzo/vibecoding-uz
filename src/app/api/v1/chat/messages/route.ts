import { after, type NextRequest } from "next/server";
import { getDbSession } from "@/lib/auth/require-auth";
import { ok, created, fail } from "@/lib/api/v1/respond";
import { ServiceError } from "@/lib/http/errors";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";
import { trackServerEvent } from "@/features/analytics/server/track";
import { messagesQuerySchema, sendMessageSchema } from "@/features/chat/contracts";
import { orchestrateAiReply } from "@/features/chat/server/ai-orchestrator.service";
import { getVisitorConversation, listMessages, markConversationRead, sendVisitorMessage } from "@/features/chat/server/chat.service";
import { getChatSettings, publicChatSettings } from "@/features/chat/server/settings.service";
import { getOrCreateVisitorToken, visitorTokenFromRequest } from "@/features/chat/server/visitor-token";
import { notifyVisitorMessage } from "@/lib/telegram/chat-bridge";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({ method: "get", path: "/api/v1/chat/messages", tags: ["chat"], summary: "Suhbat xabarlari (polling)", responses: { 200: { description: "OK" } } });
registerV1Route({ method: "post", path: "/api/v1/chat/messages", tags: ["chat"], summary: "Tashrifchi xabar yuboradi", request: { body: { content: { "application/json": { schema: sendMessageSchema } } } }, responses: { 200: { description: "OK" } } });

async function visitorIdentity(request: NextRequest) {
  return visitorTokenFromRequest(request) || (await getOrCreateVisitorToken()).token;
}

export async function GET(request: NextRequest) {
  try {
    const parsed = messagesQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) return fail(new ServiceError("validation_error", "So'rov ma'lumotlari noto'g'ri", 400));
    const token = await visitorIdentity(request);
    const [conversation, messages] = await Promise.all([
      getVisitorConversation(token), listMessages(token, parsed.data.after),
    ]);
    if (parsed.data.conversationId && parsed.data.conversationId !== conversation?.id) {
      throw new ServiceError("NOT_FOUND", "Suhbat topilmadi", 404);
    }
    if (conversation) await markConversationRead(token, "visitor");
    return ok({ conversation, messages, nextCursor: messages.at(-1)?.createdAt ?? null });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const [perSecond, hourly] = await Promise.all([
      checkRateLimit(`chat-second:${ip}`, { limit: 1, windowSeconds: 1, prefix: "chat-second" }),
      checkRateLimit(`chat-hour:${ip}`, { limit: 60, windowSeconds: 3600, prefix: "chat-hour" }),
    ]);
    if (!perSecond.success) return fail(createRateLimitResponse(perSecond));
    if (!hourly.success) return fail(createRateLimitResponse(hourly));

    const parsed = sendMessageSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail(new ServiceError("validation_error", "Xabar yoki aloqa ma'lumotlari noto'g'ri", 400));
    if (parsed.data.honeypot) return created({ accepted: true });

    const settings = await getChatSettings();
    if (!settings.enabled) throw new ServiceError("CHAT_DISABLED", "Chat vaqtincha yopilgan", 503);
    const token = await visitorIdentity(request);
    const existing = await getVisitorConversation(token);
    if (!existing) {
      const newConversation = await checkRateLimit(`chat-new:${ip}`, {
        limit: 10, windowSeconds: 3600, prefix: "chat-new",
      });
      if (!newConversation.success) return fail(createRateLimitResponse(newConversation));
    }
    const session = await getDbSession(request.headers.get("cookie"));
    const message = await sendVisitorMessage(token, parsed.data, session?.userId);
    const conversation = await getVisitorConversation(token);
    if (!conversation) throw new ServiceError("NOT_FOUND", "Suhbat topilmadi", 404);

    after(async () => {
      await Promise.allSettled([
        orchestrateAiReply(conversation.id),
        settings.telegramNotify ? notifyVisitorMessage(conversation, message) : Promise.resolve({ sent: false }),
      ]);
    });
    void trackServerEvent({ type: "chat_message", path: parsed.data.sourcePath, props: { conversationId: conversation.id, messageLength: parsed.data.body.length } });
    return created({ message, conversation, settings: publicChatSettings(settings) });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "42P01") {
      return fail(new ServiceError("database_unavailable", "Chat vaqtincha texnik xizmatga murojaat qilmoqda. Xabaringizni saqlab qoling.", 503));
    }
    return fail(error);
  }
}
