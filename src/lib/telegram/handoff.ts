import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { operatorHandoffSchema, OperatorHandoffInput } from "@/lib/validations";
import { sendTelegramMessage } from "./messages";

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
    `👤 <b>Foydalanuvchi:</b> ${name}`,
    `📞 <b>Telefon:</b> ${phone}`,
    `🆔 <b>Telegram ID:</b> <code>${tgUserId}</code>`,
    tgUsername ? `🌐 <b>Username:</b> @${tgUsername}` : "",
    reason ? `📝 <b>Sabab:</b> ${reason}` : "",
    `🕒 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}`,
  ].filter(Boolean).join("\n");

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId) await sendTelegramMessage(adminChatId, message, "HTML");

  return {
    success: true,
    message: "Operator bilan bog'lanish so'rovingiz qabul qilindi. Tez orada professional AI mentorimiz siz bilan bog'lanadi.",
  };
}
