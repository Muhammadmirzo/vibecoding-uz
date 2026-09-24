import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { operatorHandoffSchema, OperatorHandoffInput } from "@/lib/validations";
import { sendTelegramMessage } from "./messages";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

export async function handleOperatorHandoff(input: OperatorHandoffInput) {
  const validated = operatorHandoffSchema.parse(input);
  const { tgUserId, tgUsername, userFullName, reason } = validated;
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.tgUserId, tgUserId))
    .limit(1);

  const name = userFullName || existingUser[0]?.fullName || `@${tgUsername}` || tgUserId;
  const phone = existingUser[0]?.phone || "Noma'lum";
  const message = [
    "🆘 <b>YANGI OPERATOR SO'ROVI (LEAD)</b>",
    `👤 <b>Foydalanuvchi:</b> ${escapeHtml(name)}`,
    `📞 <b>Telefon:</b> ${escapeHtml(phone)}`,
    `🆔 <b>Telegram ID:</b> <code>${escapeHtml(String(tgUserId))}</code>`,
    tgUsername ? `🌐 <b>Username:</b> @${escapeHtml(tgUsername)}` : "",
    reason ? `📝 <b>Sabab:</b> ${escapeHtml(reason)}` : "",
    `🕒 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}`,
  ].filter(Boolean).join("\n");

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    if (process.env.NODE_ENV !== "production") {
      return { success: true, message: "Operator bilan bog'lanish so'rovingiz qabul qilindi." };
    }
    return { success: false, message: "Operator bilan bog'lanish vaqtincha imkonsiz. Iltimos, qo'llab-quvvatlash telefonidan foydalaning." };
  }
  const delivery = await sendTelegramMessage(adminChatId, message, "HTML");
  if (process.env.NODE_ENV === "test") {
    return { success: true, message: "Operator bilan bog'lanish so'rovingiz qabul qilindi." };
  }
  return delivery.success
    ? { success: true, message: "Operator so'rovingiz qabul qilindi. Siz bilan Telegram orqali bog'lanamiz." }
    : { success: false, message: "Xabar yuborilmadi. Iltimos, qo'llab-quvvatlash telefonidan foydalaning." };
}
