import type { DbExecutor } from "@/features/payments/server/payments.repository";
import { referralCodeSchema } from "../domain/referral-code";

/** Minimal store for the non-transactional attribution path. */
export interface AttributionStore {
  resolveReferrerByCode(code: string): Promise<{ id: string } | null>;
  attributeReferral(referrerUserId: string, referredUserId: string): Promise<void>;
}

/** Minimal store for the transactional attribution path (registration). */
export interface AttributionTxStore {
  resolveReferrerByCodeTx(ex: DbExecutor, code: string): Promise<{ id: string } | null>;
  attributeReferralTx(ex: DbExecutor, referrerUserId: string, referredUserId: string): Promise<void>;
}

export interface AttributionInput {
  code: string;
  referredUserId: string;
}

export type AttributionOutcome =
  | { attributed: true; referrerUserId: string }
  | { attributed: false; reason: "empty" | "invalid" | "self" | "unresolvable" };

async function attribute(
  resolve: (code: string) => Promise<{ id: string } | null>,
  attributeReferral: (referrerUserId: string, referredUserId: string) => Promise<void>,
  input: AttributionInput,
): Promise<AttributionOutcome> {
  const code = input.code.trim();
  if (!code) return { attributed: false, reason: "empty" };
  if (!referralCodeSchema.safeParse(code).success) return { attributed: false, reason: "invalid" };
  const referrer = await resolve(code);
  if (!referrer) return { attributed: false, reason: "unresolvable" };
  if (referrer.id === input.referredUserId) return { attributed: false, reason: "self" };
  // referrals.referredUserId is unique: repeats are no-ops, never overwrites.
  await attributeReferral(referrer.id, input.referredUserId);
  return { attributed: true, referrerUserId: referrer.id };
}

/**
 * Attributes a referral from a `ref_code` cookie value. No-op when the
 * code is empty, malformed/unresolvable, or the user's own code.
 */
export function attributeReferralFromCookie(
  store: AttributionStore,
  input: AttributionInput,
): Promise<AttributionOutcome> {
  return attribute(
    (code) => store.resolveReferrerByCode(code),
    (referrer, referred) => store.attributeReferral(referrer, referred),
    input,
  );
}

/** Same as above but runs the resolve + insert on the given transaction. */
export function attributeReferralFromCookieTx(
  store: AttributionTxStore,
  ex: DbExecutor,
  input: AttributionInput,
): Promise<AttributionOutcome> {
  return attribute(
    (code) => store.resolveReferrerByCodeTx(ex, code),
    (referrer, referred) => store.attributeReferralTx(ex, referrer, referred),
    input,
  );
}
