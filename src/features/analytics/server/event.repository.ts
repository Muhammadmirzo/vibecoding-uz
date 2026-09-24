import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import type { NewAnalyticsEventRow } from "@/db/schema/analytics";

export interface AnalyticsEventInsert extends Omit<NewAnalyticsEventRow, "id" | "receivedAt"> {}

export interface AnalyticsEventRepository {
  insertMany(events: AnalyticsEventInsert[]): Promise<number>;
}

export class DrizzleAnalyticsEventRepository implements AnalyticsEventRepository {
  async insertMany(events: AnalyticsEventInsert[]): Promise<number> {
    if (events.length === 0) return 0;
    const inserted = await db
      .insert(analyticsEvents)
      .values(events)
      .onConflictDoNothing({ target: analyticsEvents.eventId })
      .returning({ id: analyticsEvents.id });
    return inserted.length;
  }
}

export const analyticsEventRepository: AnalyticsEventRepository =
  new DrizzleAnalyticsEventRepository();
