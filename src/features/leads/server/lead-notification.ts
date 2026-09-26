import { after } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram/messages";
import { BRAND } from "@/config/brand";

/**
 * New-lead alert for the manager chat.
 *
 * Rules (g1b):
 * - best-effort: the lead row is already saved, a failed alert must never
 *   surface to the visitor (callers use `void scheduleNewLeadAlert(...)`);
 * - **never a bare `void notifyNewLead(...)`**: a fire-and-forget promise is
 *   dropped when the Vercel function freezes after the response, so the
 *   manager would lose the alert. `scheduleNewLeadAlert` hands the send to
 *   Next's `after()` (stable in 15.5), which runs it *after* the response is
 *   flushed and keeps the function alive for it. Outside a request scope
 *   (unit tests, cron, the Telegram bot) `after()` throws E468 and the helper
 *   falls back to awaiting the alert with a short timeout;
 * - silent skip + one log when `TELEGRAM_ADMIN_CHAT_ID` is not configured
 *   (missing optional env degrades quietly, L10);
 * - deduped per lead id so a retry cannot spam the chat.
 */

/** Upper bound for the out-of-scope fallback; the lead save never waits on Telegram. */
export const ALERT_FALLBACK_TIMEOUT_MS = 3_000;

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

/** Resolve on timeout too, so a hanging Telegram call cannot pin the caller. */
async function withShortTimeout(promise: Promise<unknown>, ms: number): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expiry = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  try {
    await Promise.race([promise.catch(() => undefined), expiry]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Schedule the manager alert so a serverless freeze cannot drop it.
 *
 * Inside a request scope the work is deferred to `after()`; the returned
 * promise resolves immediately (callers use `void`, so the lead save is
 * never blocked and never fails because of Telegram). Out of scope the
 * alert is awaited with a short timeout instead.
 */
export function scheduleNewLeadAlert(alert: NewLeadAlert): Promise<void> {
  const send = (): Promise<unknown> => notifyNewLead(alert);
  try {
    after(() => {
      void send();
    });
    return Promise.resolve();
  } catch {
    // `after` is only available inside a request scope (E468) — fall back.
    return withShortTimeout(send(), ALERT_FALLBACK_TIMEOUT_MS);
  }
}
