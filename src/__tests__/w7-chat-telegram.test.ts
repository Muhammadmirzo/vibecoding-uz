import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state = {
    selectResults: [] as unknown[][],
    updates: [] as Array<{ values: Record<string, unknown> }>,
  };
  const db = {
    select: () => {
      const limit = async () => state.selectResults.shift() || [];
      return { from: () => ({ where: () => ({ limit, orderBy: () => ({ limit }) }) }) };
    },
    update: () => ({
      set: (values: Record<string, unknown>) => {
        state.updates.push({ values });
        return { where: async () => undefined };
      },
    }),
  };
  return Object.assign(state, { db, postReply: vi.fn(), sendTelegramMessage: vi.fn(), setTelegramReaction: vi.fn() });
});
vi.mock("@/db", () => ({ db: mocks.db }));
vi.mock("@/features/chat/server/chat.service", () => ({ postReply: mocks.postReply }));
vi.mock("@/lib/telegram/messages", () => ({ sendTelegramMessage: mocks.sendTelegramMessage, setTelegramReaction: mocks.setTelegramReaction }));

import { handleTelegramChatReply, notifyVisitorMessage, telegramAdminAllowed } from "@/lib/telegram/chat-bridge";

const conversation = { id: "11111111-1111-4111-8111-111111111111", displayName: "Mehmon", status: "pending" as const, aiMode: "off" as const, assignedAdminId: null, userId: null, leadId: null, lastMessageAt: new Date().toISOString(), unreadForAdmin: 1, unreadForVisitor: 0, sourcePath: "/kurs/test", device: "test", contactPhone: null, contactTelegram: null, createdAt: new Date().toISOString() };
const message = { id: "22222222-2222-4222-8222-222222222222", conversationId: conversation.id, clientId: "client", sender: "visitor" as const, body: "Yordam kerak", createdAt: new Date().toISOString(), readAt: null, isDraft: false, replyTo: null };

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
    mocks.selectResults.push([{ id: message.id, conversationId: conversation.id, sender: "visitor", replyToId: null }]);
    const handled = await handleTelegramChatReply({ from: { id: 123 }, message: { message_id: 88, reply_to_message: { message_id: 77 }, text: "Albatta" } });
    expect(handled).toBe(true);
    expect(mocks.postReply).toHaveBeenCalledWith(null, conversation.id, "Albatta", "telegram-88", "telegram", message.id);
    expect(mocks.updates[0]?.values).toEqual({ telegramMessageId: "88" });
  });

  it("reads the sender from message.from (real Telegram update shape)", async () => {
    mocks.selectResults.push([{ id: message.id, conversationId: conversation.id, sender: "visitor", replyToId: null }]);
    const handled = await handleTelegramChatReply({ message: { message_id: 89, from: { id: 123 }, reply_to_message: { message_id: 77 }, text: "Albatta" } });
    expect(handled).toBe(true);
  });

  it("rejects a non-allowlisted Telegram user", async () => {
    const handled = await handleTelegramChatReply({ from: { id: 999 }, message: { message_id: 88, reply_to_message: { message_id: 77 }, text: "Albatta" } });
    expect(handled).toBe(false);
    expect(mocks.postReply).not.toHaveBeenCalled();
  });
});

describe("Telegram reply threading", () => {
  const group = { id: -100, type: "supergroup" };

  it("links each reply to the exact visitor message it answers and confirms with a reaction", async () => {
    mocks.selectResults.push([{ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", conversationId: conversation.id, sender: "visitor", replyToId: null }]);
    mocks.selectResults.push([{ id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", conversationId: conversation.id, sender: "visitor", replyToId: null }]);
    await handleTelegramChatReply({ message: { message_id: 90, from: { id: 123 }, chat: group, reply_to_message: { message_id: 71 }, text: "Birinchisiga" } });
    await handleTelegramChatReply({ message: { message_id: 91, from: { id: 123 }, chat: group, reply_to_message: { message_id: 72 }, text: "Ikkinchisiga" } });
    expect(mocks.postReply).toHaveBeenNthCalledWith(1, null, conversation.id, "Birinchisiga", "telegram-90", "telegram", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(mocks.postReply).toHaveBeenNthCalledWith(2, null, conversation.id, "Ikkinchisiga", "telegram-91", "telegram", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
    expect(mocks.setTelegramReaction).toHaveBeenCalledWith(-100, 90);
    expect(mocks.setTelegramReaction).toHaveBeenCalledWith(-100, 91);
  });

  it("replying to an earlier admin answer keeps the original visitor message as the thread", async () => {
    mocks.selectResults.push([{ id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", conversationId: conversation.id, sender: "admin", replyToId: message.id }]);
    await handleTelegramChatReply({ message: { message_id: 92, from: { id: 123 }, chat: group, reply_to_message: { message_id: 88 }, text: "Yana" } });
    expect(mocks.postReply).toHaveBeenCalledWith(null, conversation.id, "Yana", "telegram-92", "telegram", message.id);
  });

  it("tells the admin when a reply to the bot cannot be matched to a chat message", async () => {
    mocks.selectResults.push([]);
    const handled = await handleTelegramChatReply({ message: { message_id: 93, from: { id: 123 }, chat: group, reply_to_message: { message_id: 5, from: { is_bot: true } }, text: "?" } });
    expect(handled).toBe(false);
    expect(mocks.postReply).not.toHaveBeenCalled();
    expect(mocks.sendTelegramMessage).toHaveBeenCalledWith(-100, expect.stringContaining("bog'lanmagan"), "HTML", 93);
  });

  it("hints to use Reply in a private chat, but stays quiet in a group", async () => {
    await handleTelegramChatReply({ message: { message_id: 94, from: { id: 123 }, chat: { id: 123, type: "private" }, text: "salom" } });
    expect(mocks.sendTelegramMessage).toHaveBeenCalledWith(123, expect.stringContaining("Reply"), "HTML", 94);
    mocks.sendTelegramMessage.mockClear();
    await handleTelegramChatReply({ message: { message_id: 95, from: { id: 123 }, chat: group, text: "hamkasbga" } });
    expect(mocks.sendTelegramMessage).not.toHaveBeenCalled();
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
