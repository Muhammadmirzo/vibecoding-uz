import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { tgAuthLinkSchema, TgAuthLinkInput } from "@/lib/validations";
import { consumeTelegramLinkToken } from "./linkToken";

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("998")) {
      cleaned = "+" + cleaned;
    } else if (cleaned.length === 9) {
      cleaned = "+998" + cleaned;
    }
  }
  return cleaned;
}

export async function linkTelegramAccount(input: TgAuthLinkInput) {
  const validated = tgAuthLinkSchema.parse(input);
  const { tgUserId, tgUsername, phone, linkToken } = validated;

  if (phone) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizePhone(phone)))
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      // NOTE: callers MUST prove the sender owns this phone number first
      // (Telegram contact with contact.user_id === sender id). See
      // handlers/contact.ts. This function links only after that check.
      await db
        .update(users)
        .set({ tgUserId, tgUsername: tgUsername || user.tgUsername })
        .where(eq(users.id, user.id));

      return { success: true, user: { id: user.id, fullName: user.fullName, phone: user.phone } };
    }
  }

  if (linkToken) {
    // Deep-link payloads are short-lived, signed, single-use tokens issued
    // for a specific user (see linkToken.ts). Raw user UUIDs are rejected.
    const verified = await consumeTelegramLinkToken(linkToken);
    if (!verified) {
      return { success: false, error: "Havola eskirgan yoki noto'g'ri" };
    }
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, verified.userId))
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      await db
        .update(users)
        .set({ tgUserId, tgUsername: tgUsername || user.tgUsername })
        .where(eq(users.id, user.id));

      return { success: true, user: { id: user.id, fullName: user.fullName, phone: user.phone } };
    }
  }

  return { success: false, error: "Foydalanuvchi topilmadi" };
}
