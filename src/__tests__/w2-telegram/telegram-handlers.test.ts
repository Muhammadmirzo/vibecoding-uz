import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Telegraf } from "telegraf";

const mocks = vi.hoisted(() => ({
  begin: vi.fn(),
  approve: vi.fn(),
  linkAccount: vi.fn(async () => ({ success: false })),
  handoff: vi.fn(async () => ({ message: "operator" })),
}));

vi.mock("@/features/auth/server/telegram-login.service", () => ({
  beginTelegramLogin: mocks.begin,
  approveTelegramLogin: mocks.approve,
}));
vi.mock("@/lib/telegram/linkAccount", () => ({ linkTelegramAccount: mocks.linkAccount }));
vi.mock("@/lib/telegram/handoff", () => ({ handleOperatorHandoff: mocks.handoff }));

import { registerStartHandler } from "@/lib/telegram/handlers/start";
import { registerAccountHandlers } from "@/lib/telegram/handlers/contact";

type TestHandler = (ctx: unknown) => Promise<unknown>;

function fakeBot() {
  let commandHandler: TestHandler | undefined;
  let contactHandler: TestHandler | undefined;
  const bot = {
    command: vi.fn((_name: string, handler: TestHandler) => { commandHandler = handler; }),
    hears: vi.fn(),
    on: vi.fn((event: string, handler: TestHandler) => {
      if (event === "contact") contactHandler = handler;
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
    mocks.approve.mockResolvedValue({ id: "22222222-2222-4222-8222-222222222222" });
    const registered = fakeBot();
    registerAccountHandlers(registered.bot);
    const reply = vi.fn(async () => ({ message_id: 3 }));

    await registered.contact()({
      from: { id: 555, first_name: "Ali", username: "ali" },
      message: { contact: { user_id: 555, phone_number: "+998901234567" } },
      reply,
    });

    expect(mocks.approve).toHaveBeenCalledOnce();
    expect(reply).toHaveBeenCalledWith(expect.stringContaining("Tayyor"), expect.objectContaining({
      reply_markup: expect.objectContaining({ remove_keyboard: true, inline_keyboard: expect.any(Array) }),
    }));
  });
});
