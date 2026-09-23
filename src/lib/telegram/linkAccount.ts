import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { tgAuthLinkSchema, TgAuthLinkInput } from "@/lib/validations";

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
      await db
        .update(users)
        .set({ tgUserId, tgUsername: tgUsername || user.tgUsername })
        .where(eq(users.id, user.id));

      return { success: true, user: { id: user.id, fullName: user.fullName, phone: user.phone } };
    }
  }

  if (linkToken) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, linkToken))
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
