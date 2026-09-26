import { sendTelegramMessage } from "@/lib/telegram/messages";
import { BRAND } from "@/config/brand";

/**
 * New-lead alert for the manager chat.
 *
 * Rules (g1b):
 * - best-effort: the lead row is already saved, a failed alert must never
 *   surface to the visitor (callers use `void notifyNewLead(...)`);
 * - silent skip + one log when `TELEGRAM_ADMIN_CHAT_ID` is not configured
 *   (missing optional env degrades quietly, L10);
 * - deduped per lead id so a retry cannot spam the chat.
 */

const MAX_SEEN = 500;
const seen = new Set<string>();

function alreadyNotified(leadId: string): boolean {
  if (seen.has(leadId)) return true;
  seen.add(leadId);
  // Bounded: a long-lived server keeps only the recent ids.
  if (seen.size > MAX_SEEN) {
    const oldest = seen.values().next().value;
    if (typeof oldest === "string") seen.delete(oldest);
  }
  return false;
}

export function resetLeadNotificationDedupe(): void {
  seen.clear();
}

export interface NewLeadAlert {
  leadId: string;
  name: string;
  contact: string;
  source: string;
  courseTitle?: string | null;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export function formatNewLeadAlert(alert: NewLeadAlert): string {
  const lines = [
    `🔔 <b>Yangi lead — ${escapeHtml(BRAND.name)}</b>`,
    "",
    `👤 Ism: <b>${escapeHtml(alert.name)}</b>`,
    `📞 Aloqa: ${escapeHtml(alert.contact)}`,
    `📌 Manba: ${escapeHtml(alert.source)}`,
  ];
  if (alert.courseTitle) lines.push(`🎓 Kurs: ${escapeHtml(alert.courseTitle)}`);
  return lines.join("\n");
}

export async function notifyNewLead(alert: NewLeadAlert): Promise<{ sent: boolean; reason?: string }> {
  if (alreadyNotified(alert.leadId)) return { sent: false, reason: "duplicate" };
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!chatId) {
    console.warn("[lead-notification] TELEGRAM_ADMIN_CHAT_ID kiritilmagan — yangi lead xabari yuborilmadi.");
    return { sent: false, reason: "chat_id_missing" };
  }
  try {
    const result = await sendTelegramMessage(chatId, formatNewLeadAlert(alert), "HTML");
    if (!result.success) console.warn("[lead-notification] Telegram yuborilmadi:", result.error);
    return { sent: result.success };
  } catch (error) {
    console.error("[lead-notification] Telegram xatosi:", error);
    return { sent: false, reason: "send_failed" };
  }
}
