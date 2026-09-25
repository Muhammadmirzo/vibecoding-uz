import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state = {
    selectResults: [] as unknown[][],
    updates: [] as Array<{ values: Record<string, unknown> }>,
  };
  const db = {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => state.selectResults.shift() || [] }) }) }),
    update: () => ({
      set: (values: Record<string, unknown>) => {
        state.updates.push({ values });
        return { where: async () => undefined };
      },
    }),
  };
  return Object.assign(state, { db, postReply: vi.fn(), sendTelegramMessage: vi.fn() });
});
vi.mock("@/db", () => ({ db: mocks.db }));
vi.mock("@/features/chat/server/chat.service", () => ({ postReply: mocks.postReply }));
vi.mock("@/lib/telegram/messages", () => ({ sendTelegramMessage: mocks.sendTelegramMessage }));

import { handleTelegramChatReply, notifyVisitorMessage, telegramAdminAllowed } from "@/lib/telegram/chat-bridge";

const conversation = { id: "11111111-1111-4111-8111-111111111111", displayName: "Mehmon", status: "pending" as const, aiMode: "off" as const, assignedAdminId: null, userId: null, leadId: null, lastMessageAt: new Date().toISOString(), unreadForAdmin: 1, unreadForVisitor: 0, sourcePath: "/kurs/test", device: "test", contactPhone: null, contactTelegram: null, createdAt: new Date().toISOString() };
const message = { id: "22222222-2222-4222-8222-222222222222", conversationId: conversation.id, clientId: "client", sender: "visitor" as const, body: "Yordam kerak", createdAt: new Date().toISOString(), readAt: null, isDraft: false };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectResults = [];
  mocks.updates = [];
  process.env.TELEGRAM_ADMIN_USER_IDS = "123,456";
  process.env.TELEGRAM_ADMIN_CHAT_ID = "-100";
  mocks.postReply.mockResolvedValue({ ...message, id: "33333333-3333-4333-8333-333333333333", sender: "admin", body: "Albatta" });
});

describe("Telegram chat bridge security", () => {
  it("fails closed when the allowlist is missing", () => {
    delete process.env.TELEGRAM_ADMIN_USER_IDS;
    expect(telegramAdminAllowed("123")).toBe(false);
  });

  it("maps only allowlisted replies and never stores Telegram ID as user UUID", async () => {
    mocks.selectResults.push([{ conversationId: conversation.id }]);
    const handled = await handleTelegramChatReply({ from: { id: 123 }, message: { message_id: 88, reply_to_message: { message_id: 77 }, text: "Albatta" } });
    expect(handled).toBe(true);
    expect(mocks.postReply).toHaveBeenCalledWith(null, conversation.id, "Albatta", "telegram-88", "telegram");
    expect(mocks.updates[0]?.values).toEqual({ telegramMessageId: "88" });
  });

  it("reads the sender from message.from (real Telegram update shape)", async () => {
    mocks.selectResults.push([{ conversationId: conversation.id }]);
    const handled = await handleTelegramChatReply({ message: { message_id: 89, from: { id: 123 }, reply_to_message: { message_id: 77 }, text: "Albatta" } });
    expect(handled).toBe(true);
  });

  it("rejects a non-allowlisted Telegram user", async () => {
    const handled = await handleTelegramChatReply({ from: { id: 999 }, message: { message_id: 88, reply_to_message: { message_id: 77 }, text: "Albatta" } });
    expect(handled).toBe(false);
    expect(mocks.postReply).not.toHaveBeenCalled();
  });
});

describe("Telegram outgoing notification", () => {
  it("notifies on every visitor message, even right after an admin reply", async () => {
    // Regression: follow-up messages were silently dropped for 2 min after an admin reply,
    // so the admin never saw (and could not Telegram-reply to) the visitor's second message.
    mocks.selectResults.push([{ id: "recent" }]);
    mocks.sendTelegramMessage.mockResolvedValue({ success: true, data: { ok: true, result: { message_id: 992 } } });
    const result = await notifyVisitorMessage(conversation, message);
    expect(result.sent).toBe(true);
    expect(mocks.sendTelegramMessage).toHaveBeenCalledTimes(1);
  });

  it("stores the returned message id on the visitor message", async () => {
    mocks.selectResults.push([]);
    mocks.sendTelegramMessage.mockResolvedValue({ success: true, data: { ok: true, result: { message_id: 991 } } });
    const result = await notifyVisitorMessage(conversation, message);
    expect(result).toEqual({ sent: true, messageId: 991 });
    expect(mocks.sendTelegramMessage).toHaveBeenCalledWith("-100", expect.stringContaining("Saytda ochish"), "HTML");
    expect(mocks.updates).toContainEqual({ values: { telegramMessageId: "991" } });
  });

  it("keeps chat working when Telegram is down", async () => {
    mocks.selectResults.push([]);
    mocks.sendTelegramMessage.mockResolvedValue({ success: false, error: "down" });
    await expect(notifyVisitorMessage(conversation, message)).resolves.toEqual({ sent: false });
  });
});
