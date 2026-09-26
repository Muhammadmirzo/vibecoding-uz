import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { telegramUpdates } from "@/db/schema";

/**
 * Telegram re-delivers an update until it gets a 2xx, so the webhook can see the same
 * update_id twice (retries, slow handlers, two instances). Insert-first on the primary key
 * is the atomic claim: only the request whose INSERT returned a row processes the update.
 */
export interface TelegramUpdateStore {
  /** true = this request owns the update; false = already received (duplicate). */
  claim(updateId: number): Promise<boolean>;
  /** Handler failed: drop the claim so Telegram's retry can process the update. */
  release(updateId: number): Promise<void>;
}

type DbExecutor = Pick<typeof db, "insert" | "delete">;

/** INSERT ... ON CONFLICT (update_id) DO NOTHING RETURNING: a row back = first delivery. */
export async function claimTelegramUpdate(ex: DbExecutor, updateId: number): Promise<boolean> {
  const rows = await ex.insert(telegramUpdates).values({ updateId })
    .onConflictDoNothing({ target: telegramUpdates.updateId })
    .returning({ updateId: telegramUpdates.updateId });
  return rows.length > 0;
}

export const drizzleTelegramUpdateStore: TelegramUpdateStore = {
  claim: (updateId) => claimTelegramUpdate(db, updateId),
  async release(updateId) {
    await db.delete(telegramUpdates).where(eq(telegramUpdates.updateId, updateId));
  },
};

/** Telegram stops retrying after ~24h; keep a week of ids, delete the rest (daily cron). */
export async function pruneTelegramUpdates(now = new Date(), keepDays = 7): Promise<number> {
  const cutoff = new Date(now.getTime() - keepDays * 86_400_000);
  const rows = await db.delete(telegramUpdates).where(lt(telegramUpdates.receivedAt, cutoff))
    .returning({ updateId: telegramUpdates.updateId });
  return rows.length;
}

/** update_id when present and a safe integer; otherwise null (no dedupe possible). */
export function updateIdOf(update: Record<string, unknown>): number | null {
  const value = update.update_id;
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}
