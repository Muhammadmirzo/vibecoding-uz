import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Telegraf } from "telegraf";

const mocks = vi.hoisted(() => ({
  begin: vi.fn(),
  approve: vi.fn(),
  callback: vi.fn(async () => "invalid"),
  linkAccount: vi.fn(async () => ({ success: false })),
  handoff: vi.fn(async () => ({ message: "operator" })),
}));

vi.mock("@/features/auth/server/telegram-login.service", () => ({
  beginTelegramLogin: mocks.begin,
  approveTelegramLogin: mocks.approve,
  handleTelegramLoginCallback: mocks.callback,
}));
vi.mock("@/lib/telegram/linkAccount", () => ({ linkTelegramAccount: mocks.linkAccount }));
vi.mock("@/lib/telegram/handoff", () => ({ handleOperatorHandoff: mocks.handoff }));

import { registerStartHandler } from "@/lib/telegram/handlers/start";
import { registerAccountHandlers } from "@/lib/telegram/handlers/contact";
import { registerTelegramLoginCallback } from "@/lib/telegram/handlers/callback";

type TestHandler = (ctx: unknown) => Promise<unknown>;

function fakeBot() {
  let commandHandler: TestHandler | undefined;
  let contactHandler: TestHandler | undefined;
  let callbackHandler: TestHandler | undefined;
  const bot = {
    command: vi.fn((_name: string, handler: TestHandler) => { commandHandler = handler; }),
    hears: vi.fn(),
    on: vi.fn((event: string, handler: TestHandler) => {
      if (event === "contact") contactHandler = handler;
      if (event === "callback_query") callbackHandler = handler;
    }),
  };
  return {
    bot: bot as unknown as Telegraf,
    command: () => {
      if (!commandHandler) throw new Error("start handler not registered");
      return commandHandler;
    },
    contact: () => {
      if (!contactHandler) throw new Error("contact handler not registered");
      return contactHandler;
    },
    callback: () => {
      if (!callbackHandler) throw new Error("callback handler not registered");
      return callbackHandler;
    },
  };
}

beforeEach(() => vi.clearAllMocks());

describe("Telegram bot login handlers", () => {
  it("binds /start login_ and prompts an unlinked user to share contact", async () => {
    mocks.begin.mockResolvedValue({ outcome: "contact_required" });
    const registered = fakeBot();
    registerStartHandler(registered.bot);
    const reply = vi.fn(async () => ({ message_id: 1 }));

    await registered.command()({
      payload: "login_abcdefghijklmnopqrstuvwxyzABCDEFG",
      from: { id: 555, first_name: "Ali" },
      reply,
    });

    expect(mocks.begin).toHaveBeenCalledWith("abcdefghijklmnopqrstuvwxyzABCDEFG", "555");
    expect(reply).toHaveBeenCalledWith(expect.stringContaining("telefon raqamingizni ulashing"), expect.objectContaining({
      reply_markup: expect.objectContaining({ keyboard: [[expect.objectContaining({ text: "📱 Raqamni ulashish" })]] }),
    }));
  });

  it("does not approve a linked user and asks for explicit confirmation", async () => {
    mocks.begin.mockResolvedValue({ outcome: "confirmation", requestId: "11111111-1111-4111-8111-111111111111", createdAt: new Date("2026-01-01T10:00:00Z"), expiresAt: new Date("2026-01-01T10:00:00Z"), userAgent: "Mozilla Chrome Windows" });
    const registered = fakeBot();
    registerStartHandler(registered.bot);
    const reply = vi.fn(async () => ({ message_id: 1 }));

    await registered.command()({ payload: "login_abcdefghijklmnopqrstuvwxyzABCDEFG", from: { id: 555 }, reply });

    expect(mocks.approve).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith(expect.stringContaining("kirish so'rovi"), expect.objectContaining({
      reply_markup: expect.objectContaining({ inline_keyboard: expect.any(Array) }),
    }));
  });

  it("confirms only through the callback and always answers the query", async () => {
    mocks.callback.mockResolvedValue("approved");
    const registered = fakeBot();
    registerTelegramLoginCallback(registered.bot);
    const answerCbQuery = vi.fn(async () => undefined);
    const editMessageText = vi.fn(async () => undefined);

    await registered.callback()({
      callbackQuery: { data: "tgl:y:11111111-1111-4111-8111-111111111111" },
      from: { id: 555 },
      answerCbQuery,
      editMessageText,
    });

    expect(mocks.callback).toHaveBeenCalledWith({ action: "y", requestId: "11111111-1111-4111-8111-111111111111", tgUserId: "555" });
    expect(answerCbQuery).toHaveBeenCalled();
    expect(editMessageText).toHaveBeenCalledWith("✅ Tasdiqlandi. Saytga qayting.", expect.anything());
  });

  it("rejects a contact owned by a different Telegram user", async () => {
    const registered = fakeBot();
    registerAccountHandlers(registered.bot);
    const reply = vi.fn(async () => ({ message_id: 2 }));

    await registered.contact()({
      from: { id: 555 },
      message: { contact: { user_id: 999, phone_number: "+998901234567" } },
      reply,
    });

    expect(mocks.approve).not.toHaveBeenCalled();
    expect(mocks.linkAccount).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith(expect.stringContaining("Faqat o'zingizning"));
  });

  it("removes the reply keyboard and sends the site button after owned contact", async () => {
    mocks.approve.mockResolvedValue({ user: { id: "22222222-2222-4222-8222-222222222222" }, requestId: "11111111-1111-4111-8111-111111111111", createdAt: new Date("2026-01-01T10:00:00Z"), expiresAt: new Date(Date.now() + 60_000), userAgent: "Chrome Windows" });
    const registered = fakeBot();
    registerAccountHandlers(registered.bot);
    const reply = vi.fn(async () => ({ message_id: 3 }));

    await registered.contact()({
      from: { id: 555, first_name: "Ali", username: "ali" },
      message: { contact: { user_id: 555, phone_number: "+998901234567" } },
      reply,
    });

    expect(mocks.approve).toHaveBeenCalledOnce();
    expect(reply).toHaveBeenCalledWith(expect.stringContaining("kirish so'rovi"), expect.objectContaining({
      reply_markup: expect.objectContaining({ inline_keyboard: expect.any(Array) }),
    }));
  });
});
