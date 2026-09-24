import { randomUUID } from "node:crypto";
import { z } from "zod";
import { withTransactionLock } from "@/db";
import { checkPayoutAmount } from "../domain/policy";
import type { DbExecutor } from "@/features/payments/server/payments.repository";
import type { ReferralsRepository } from "./referrals.repository";

export const payoutRequestSchema = z.object({
  payoutMethod: z.enum(["uzcard_humo", "course_balance"]),
  cardNumber: z.string().regex(/^[0-9]{16}$/, "Karta raqami 16 xonali bo'lishi kerak").optional().or(z.literal("")),
  cardHolder: z.string().optional().or(z.literal("")),
  amountTiyin: z.number().int().positive("Summa kiritilishi kerak"),
  idempotencyKey: z.string().uuid().optional(),
});

export type PayoutRequestInput = z.infer<typeof payoutRequestSchema> & { userId: string };

export class PayoutError extends Error {
  constructor(public code: "EXCEEDS_BALANCE" | "BELOW_MINIMUM" | "INVALID_AMOUNT", message: string) {
    super(message);
  }
}

export interface PayoutOutcome {
  payoutId: string;
  status: string;
  amountTiyin: number;
  balanceTiyin: number;
  replay: boolean;
}

type PayoutTxOutcome = {
  payoutId: string;
  status: string;
  amountTiyin: number;
  balanceTiyin: number;
  replay: boolean;
};

/**
 * Payout workflow: balance is computed server-side from paid referred
 * payments; the client amount must not exceed it. The idempotency
 * check, the balance check, and the insert run inside a single
 * transaction, so concurrent requests with one key create one payout
 * and concurrent requests with different keys cannot overdraw.
 */
export async function requestPayout(repo: ReferralsRepository, input: PayoutRequestInput): Promise<PayoutOutcome> {
  const key = input.idempotencyKey ?? randomUUID();
  return withTransactionLock<PayoutTxOutcome>(`payout:${key}`, async (tx: DbExecutor | null | undefined) => {
    const ex = tx ?? null;
    if (!ex) throw new Error("Referral database transaction is unavailable");
    const replayed = await repo.findPayoutByKeyTx(ex, key);
    if (replayed) {
      const balance = await repo.loadBalanceTx(ex, input.userId);
      return {
        payoutId: replayed.id, status: replayed.status, amountTiyin: replayed.amountTiyin,
        balanceTiyin: balance.balanceTiyin, replay: true,
      };
    }
    const balance = await repo.loadBalanceTx(ex, input.userId);
    const check = checkPayoutAmount(input.amountTiyin, balance.balanceTiyin);
    if (!check.ok) throw new PayoutError(check.reason, check.message);
    const created = await repo.createPayoutTx(ex, {
      userId: input.userId,
      amountTiyin: input.amountTiyin,
      payoutMethod: input.payoutMethod,
      cardLast4: input.cardNumber ? input.cardNumber.slice(-4) : null,
      idempotencyKey: key,
    });
    return {
      payoutId: created.id,
      status: created.status,
      amountTiyin: created.amountTiyin,
      balanceTiyin: balance.balanceTiyin - created.amountTiyin,
      replay: false,
    };
  });
}
