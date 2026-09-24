import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
    eventId: uuid("event_id").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    sessionId: uuid("session_id").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    path: text("path").notNull(),
    referrerHost: text("referrer_host"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmTerm: text("utm_term"),
    utmContent: text("utm_content"),
    device: text("device").notNull(),
    browserFamily: text("browser_family").notNull(),
    country: text("country"),
    props: jsonb("props").$type<Record<string, unknown>>().notNull().default({}),
    valueUzs: integer("value_uzs"),
  },
  (table) => [
    uniqueIndex("analytics_events_event_id_uidx").on(table.eventId),
    index("analytics_events_occurred_at_idx").on(table.occurredAt),
    index("analytics_events_type_occurred_at_idx").on(table.type, table.occurredAt),
    index("analytics_events_visitor_occurred_at_idx").on(table.visitorHash, table.occurredAt),
    index("analytics_events_session_id_idx").on(table.sessionId),
  ],
);

export type AnalyticsEventRow = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEventRow = typeof analyticsEvents.$inferInsert;
