import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { payoutStatusEnum } from "./enums";
import { users } from "./users";
import { enrollments, payments } from "./commercial";

// Who invited whom. Written once (e.g. at registration with a referral code);
// referredUserId is unique so attribution cannot be overwritten or double-counted.
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerUserId: uuid("referrer_user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  referredUserId: uuid("referred_user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cash-out requests against the earned referral balance. Server-computed only:
// the client amount must never exceed the balance (checked in the service).
// idempotencyKey makes retries safe: replays return the original row.
export const referralPayouts = pgTable("referral_payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amountTiyin: integer("amount_tiyin").notNull(),
  payoutMethod: text("payout_method").notNull(),
  cardLast4: text("card_last4"),
  status: payoutStatusEnum("status").default("pending").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recorded refund requests. Creating a request revokes course access
// (enrollment -> paused); the provider-side money movement is an ops step
// tracked via status, so a request is never silently marked "refunded".
export const refundRequests = pgTable("refund_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "cascade" }).notNull(),
  enrollmentId: uuid("enrollment_id").references(() => enrollments.id, { onDelete: "set null" }),
  amountTiyin: integer("amount_tiyin").notNull(),
  reason: text("reason"),
  status: payoutStatusEnum("status").default("pending").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
