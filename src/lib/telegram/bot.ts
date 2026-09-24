import { Telegraf } from "telegraf";
import { registerAccountHandlers } from "./handlers/contact";
import { handleTelegramChatReply } from "./chat-bridge";
import { registerMenuHandlers } from "./handlers/commands";
import { registerStartHandler } from "./handlers/start";
import { registerTelegramLoginCallback } from "./handlers/callback";

let botInstance: Telegraf | null = null;

export function initTelegramBot(): Telegraf | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  if (botInstance) return botInstance;

  const bot = new Telegraf(token);
  registerStartHandler(bot);
  registerTelegramLoginCallback(bot);
  registerMenuHandlers(bot);
  registerAccountHandlers(bot);
  bot.on("message", async (ctx) => { await handleTelegramChatReply(ctx.update as unknown as Parameters<typeof handleTelegramChatReply>[0]); });

  botInstance = bot;
  return bot;
}

export function getTelegramBot(): Telegraf | null {
  return botInstance ?? initTelegramBot();
}

export { linkTelegramAccount } from "./linkAccount";
export { handleOperatorHandoff } from "./handoff";
export { sendHomeworkSubmissionAlert, sendMeetReminder, sendTelegramMessage } from "./messages";
