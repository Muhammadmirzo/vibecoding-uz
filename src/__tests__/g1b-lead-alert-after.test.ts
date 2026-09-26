import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * g1b: the new-lead alert must survive a serverless freeze, so it is handed to
 * Next's `after()` instead of a bare `void promise`, and it must degrade to a
 * bounded await when there is no request scope (tests, cron, bot).
 */

const { sendTelegramMessage, afterMock } = vi.hoisted(() => ({
  sendTelegramMessage: vi.fn<(chatId: string, text: string, parseMode?: string) => Promise<{ success: boolean }>>(
    async () => ({ success: true }),
  ),
  afterMock: vi.fn<(task: () => void) => void>(),
}));

// Analytics also schedules with after(); stub it so the after() queue holds
// only the lead alert and this test never touches the DB.
vi.mock("@/features/analytics/server/track", () => ({ trackServerEvent: vi.fn(async () => undefined) }));
vi.mock("@/lib/telegram/messages", () => ({ sendTelegramMessage }));
vi.mock("next/server", () => ({ after: afterMock }));

import {
  ALERT_FALLBACK_TIMEOUT_MS,
  scheduleNewLeadAlert,
  resetLeadNotificationDedupe,
} from "@/features/leads/server/lead-notification";
import { submitQuizLead, submitFreeLessonLead } from "@/features/quiz/server/quiz.service";

const alert = { leadId: "lead-after-1", name: "Ali", contact: "+998901234567", source: "Diagnostika" };
const quizAnswers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

function repo() {
  return {
    insertLead: async () => ({ id: "11111111-1111-4111-8111-111111111111" }),
    insertFreeLessonLead: async () => ({ id: "22222222-2222-4222-8222-222222222222" }),
    findCourseIdBySlug: async () => "course-1",
  };
}

/** `after()` stores the callback; running it is what the platform does post-response. */
function flushAfterTasks(): void {
  for (const [task] of afterMock.mock.calls) task();
}

describe("lead alert scheduling with after()", () => {
  const originalChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  beforeEach(() => {
    sendTelegramMessage.mockClear();
    afterMock.mockClear();
    afterMock.mockImplementation(() => undefined);
    resetLeadNotificationDedupe();
    process.env.TELEGRAM_ADMIN_CHAT_ID = "-100123";
  });

  afterEach(() => {
    if (originalChatId === undefined) delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    else process.env.TELEGRAM_ADMIN_CHAT_ID = originalChatId;
  });

  it("defers the Telegram send to after(), so the response is not held by it", () => {
    scheduleNewLeadAlert(alert);

    expect(afterMock).toHaveBeenCalledTimes(1);
    expect(sendTelegramMessage).not.toHaveBeenCalled();
  });

  it("actually sends once the after() task runs", () => {
    scheduleNewLeadAlert(alert);
    flushAfterTasks();

    expect(sendTelegramMessage).toHaveBeenCalledTimes(1);
    expect(sendTelegramMessage.mock.calls[0][0]).toBe("-100123");
  });

  it("resolves without waiting for the deferred send (never blocks the lead save)", async () => {
    await expect(scheduleNewLeadAlert(alert)).resolves.toBeUndefined();
    expect(sendTelegramMessage).not.toHaveBeenCalled();
  });

  it("falls back to a bounded await when after() has no request scope (E468)", async () => {
    afterMock.mockImplementation(() => {
      throw Object.defineProperty(new Error("`after` was called outside a request scope"), "__NEXT_ERROR_CODE", {
        value: "E468",
      });
    });

    await scheduleNewLeadAlert(alert);

    expect(afterMock).toHaveBeenCalledTimes(1);
    expect(sendTelegramMessage).toHaveBeenCalledTimes(1);
    expect(ALERT_FALLBACK_TIMEOUT_MS).toBeLessThanOrEqual(5_000);
  });

  it("a rejected after() task never becomes an unhandled rejection", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    sendTelegramMessage.mockRejectedValueOnce(new Error("network down"));
    afterMock.mockImplementation(() => undefined);

    await expect(scheduleNewLeadAlert(alert)).resolves.toBeUndefined();
    flushAfterTasks();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("routes the quiz and free-lesson lead paths through after()", async () => {
    await submitQuizLead(repo(), { name: "Ali", phone: "+998901234567", quizAnswers });
    await submitFreeLessonLead(repo(), { name: "Ali", telegram: "@ali" });

    expect(afterMock).toHaveBeenCalledTimes(2);
    expect(sendTelegramMessage).not.toHaveBeenCalled();
    flushAfterTasks();
    expect(sendTelegramMessage).toHaveBeenCalledTimes(2);
  });
});
