import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { chatSettingsSchema, type ChatSettingsInput } from "../contracts";

export async function getChatSettings(): Promise<ChatSettingsInput> { try { const rows = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "chat")).limit(1); return chatSettingsSchema.parse(rows[0]?.value); } catch { return chatSettingsSchema.parse({}); } }
export async function saveChatSettings(value: ChatSettingsInput): Promise<ChatSettingsInput> { const parsed = chatSettingsSchema.parse(value); await db.insert(siteSettings).values({ key: "chat", value: parsed }).onConflictDoUpdate({ target: siteSettings.key, set: { value: parsed, updatedAt: new Date() } }); return parsed; }
