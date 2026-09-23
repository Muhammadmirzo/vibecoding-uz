import { Telegraf } from "telegraf";
import { registerAccountHandlers } from "./handlers/contact";
import { registerMenuHandlers } from "./handlers/commands";
import { registerStartHandler } from "./handlers/start";

let botInstance: Telegraf | null = null;

export function initTelegramBot(): Telegraf | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  if (botInstance) return botInstance;

  const bot = new Telegraf(token);
  registerStartHandler(bot);
  registerMenuHandlers(bot);
  registerAccountHandlers(bot);

  botInstance = bot;
  return bot;
}

export function getTelegramBot(): Telegraf | null {
  return botInstance ?? initTelegramBot();
}

export { linkTelegramAccount } from "./linkAccount";
export { handleOperatorHandoff } from "./handoff";
export { sendHomeworkSubmissionAlert, sendMeetReminder, sendTelegramMessage } from "./messages";
