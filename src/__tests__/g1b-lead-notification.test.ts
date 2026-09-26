import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendTelegramMessage } = vi.hoisted(() => ({
  sendTelegramMessage: vi.fn(async (_chatId: string, _text: string) => ({ success: true })),
}));

vi.mock("@/lib/telegram/messages", () => ({ sendTelegramMessage }));

import {
  formatNewLeadAlert,
  notifyNewLead,
  resetLeadNotificationDedupe,
} from "@/features/leads/server/lead-notification";
import { submitQuizLead, submitFreeLessonLead } from "@/features/quiz/server/quiz.service";

const lead = { name: "Ali", phone: "+998901234567" };
const quizAnswers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

function repo() {
  return {
    insertLead: async () => ({ id: "11111111-1111-4111-8111-111111111111" }),
    insertFreeLessonLead: async () => ({ id: "22222222-2222-4222-8222-222222222222" }),
    findCourseIdBySlug: async () => "course-1",
  };
}

describe("new-lead Telegram notification (g1b)", () => {
  const originalChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  beforeEach(() => {
    sendTelegramMessage.mockClear();
    resetLeadNotificationDedupe();
    process.env.TELEGRAM_ADMIN_CHAT_ID = "-100123";
  });

  afterEach(() => {
    if (originalChatId === undefined) delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    else process.env.TELEGRAM_ADMIN_CHAT_ID = originalChatId;
  });

  it("alerts the manager chat with the TELEGRAM_ADMIN_CHAT_ID from the env", async () => {
    const result = await notifyNewLead({ leadId: "lead-1", name: "Ali", contact: "+998901234567", source: "Diagnostika" });
    expect(result.sent).toBe(true);
    expect(sendTelegramMessage).toHaveBeenCalledTimes(1);
    const [chatId, text] = sendTelegramMessage.mock.calls[0];
    expect(chatId).toBe("-100123");
    expect(text).toContain("Ali");
    expect(text).toContain("+998901234567");
  });

  it("skips silently with a log when the chat id env is missing", async () => {
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const result = await notifyNewLead({ leadId: "lead-2", name: "Ali", contact: "+998901234567", source: "test" });
    expect(result).toEqual({ sent: false, reason: "chat_id_missing" });
    expect(sendTelegramMessage).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("dedupes by lead id so a retry cannot double-notify", async () => {
    const alert = { leadId: "lead-3", name: "Ali", contact: "+998901234567", source: "test" };
    await notifyNewLead(alert);
    const second = await notifyNewLead(alert);
    expect(second.reason).toBe("duplicate");
    expect(sendTelegramMessage).toHaveBeenCalledTimes(1);
  });

  it("never lets a Telegram failure break the lead save", async () => {
    sendTelegramMessage.mockRejectedValueOnce(new Error("network down"));
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const stored = await submitQuizLead(repo(), { ...lead, quizAnswers });
    expect(stored.leadId).toBe("11111111-1111-4111-8111-111111111111");
    error.mockRestore();
  });

  it("fires from the quiz submission path", async () => {
    await submitQuizLead(repo(), { ...lead, quizAnswers });
    expect(sendTelegramMessage).toHaveBeenCalledTimes(1);
  });

  it("fires from the free-lesson path with the Telegram handle as contact", async () => {
    await submitFreeLessonLead(repo(), { name: "Ali", telegram: "@ali" });
    expect(sendTelegramMessage).toHaveBeenCalledTimes(1);
    expect(sendTelegramMessage.mock.calls[0][1]).toContain("@ali");
  });

  it("formats an alert without leaking raw HTML from user input", () => {
    const text = formatNewLeadAlert({ leadId: "l", name: "<b>Ali</b>", contact: "@ali", source: "test" });
    expect(text).toContain("&lt;b&gt;Ali&lt;/b&gt;");
    expect(text).not.toContain("<b>Ali</b>");
  });
});
