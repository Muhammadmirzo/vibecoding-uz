import { lt } from "drizzle-orm";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";

export interface AnalyticsRetentionRepository { deleteBefore(cutoff: Date): Promise<number> }
export class DrizzleAnalyticsRetentionRepository implements AnalyticsRetentionRepository {
  async deleteBefore(cutoff: Date): Promise<number> {
    const deleted = await db.delete(analyticsEvents).where(lt(analyticsEvents.occurredAt, cutoff)).returning({ id: analyticsEvents.id });
    return deleted.length;
  }
}
export const analyticsRetentionRepository: AnalyticsRetentionRepository = new DrizzleAnalyticsRetentionRepository();
