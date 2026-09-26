import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const handleUpdate = vi.hoisted(() => vi.fn());
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/lib/telegram/bot", () => ({ getTelegramBot: () => ({ handleUpdate }) }));
vi.mock("@/lib/security/rateLimit", () => ({
  checkRateLimit: async () => ({ success: true }),
  getClientIp: () => "1.2.3.4",
  createRateLimitResponse: () => new Response(null, { status: 429 }),
  PRESETS: { WEBHOOK: {} },
}));

import { handleTelegramWebhook } from "@/lib/telegram/webhookHandler";
import { updateIdOf, type TelegramUpdateStore } from "@/lib/telegram/updateDedupe";

/** In-memory twin of the telegram_updates primary key: claim is atomic, like INSERT ON CONFLICT DO NOTHING. */
function memoryStore(): TelegramUpdateStore & { ids: Set<number> } {
  const ids = new Set<number>();
  return {
    ids,
    async claim(id) { if (ids.has(id)) return false; ids.add(id); return true; },
    async release(id) { ids.delete(id); },
  };
}

// Real update shape from the Bot API (message.from is the sender, lesson L9).
const update = {
  update_id: 912345678,
  message: { message_id: 7, date: 1790000000, chat: { id: 42, type: "private" }, from: { id: 42, is_bot: false, first_name: "Ali" }, text: "/start" },
};

function webhook(body: unknown) {
  return new NextRequest("https://app.test/api/telegram/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "hook-secret" },
    body: JSON.stringify(body),
  });
}

describe("F1: Telegram webhook dedupe by update_id", () => {
  beforeEach(() => {
    vi.stubEnv("TELEGRAM_WEBHOOK_SECRET", "hook-secret");
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123:abc");
    handleUpdate.mockReset();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("processes a redelivered update only once", async () => {
    const store = memoryStore();
    const first = await handleTelegramWebhook(webhook(update), store);
    const second = await handleTelegramWebhook(webhook(update), store);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ ok: true, duplicate: true });
    expect(handleUpdate).toHaveBeenCalledTimes(1);
  });

  it("two parallel deliveries of the same update run the handler once", async () => {
    const store = memoryStore();
    await Promise.all([handleTelegramWebhook(webhook(update), store), handleTelegramWebhook(webhook(update), store)]);
    expect(handleUpdate).toHaveBeenCalledTimes(1);
  });

  it("releases the claim when the handler fails so Telegram's retry is processed", async () => {
    const store = memoryStore();
    handleUpdate.mockRejectedValueOnce(new Error("boom"));
    const failed = await handleTelegramWebhook(webhook(update), store);
    expect(failed.status).toBe(500);
    expect(store.ids.has(update.update_id)).toBe(false);
    const retried = await handleTelegramWebhook(webhook(update), store);
    expect(retried.status).toBe(200);
    expect(handleUpdate).toHaveBeenCalledTimes(2);
  });

  it("updateIdOf accepts only non-negative safe integers", () => {
    expect(updateIdOf(update)).toBe(912345678);
    expect(updateIdOf({ update_id: "1" })).toBeNull();
    expect(updateIdOf({})).toBeNull();
  });
});
