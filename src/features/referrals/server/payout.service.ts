import { randomUUID } from "node:crypto";
import { z } from "zod";
import { checkPayoutAmount } from "../domain/policy";
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

/**
 * Payout workflow: balance is computed server-side from paid referred
 * payments; the client amount must not exceed it. Idempotent via key.
 */
export async function requestPayout(repo: ReferralsRepository, input: PayoutRequestInput): Promise<PayoutOutcome> {
  const key = input.idempotencyKey ?? randomUUID();
  const replayed = await repo.findPayoutByKey(key);
  if (replayed) {
    const balance = await repo.loadBalance(input.userId);
    return { payoutId: replayed.id, status: replayed.status, amountTiyin: replayed.amountTiyin, balanceTiyin: balance.balanceTiyin, replay: true };
  }

  const balance = await repo.loadBalance(input.userId);
  const check = checkPayoutAmount(input.amountTiyin, balance.balanceTiyin);
  if (!check.ok) throw new PayoutError(check.reason, check.message);

  const created = await repo.createPayout({
    userId: input.userId,
    amountTiyin: input.amountTiyin,
    payoutMethod: input.payoutMethod,
    cardLast4: input.cardNumber ? input.cardNumber.slice(-4) : null,
    idempotencyKey: key,
  }).catch(async (error: unknown) => {
    // Unique-key race: another request won, return the original row.
    if (error instanceof Error && /unique|duplicate/i.test(error.message)) {
      const winner = await repo.findPayoutByKey(key);
      if (winner) return winner;
    }
    throw error;
  });

  return {
    payoutId: created.id,
    status: created.status,
    amountTiyin: created.amountTiyin,
    balanceTiyin: balance.balanceTiyin - created.amountTiyin,
    replay: false,
  };
}
