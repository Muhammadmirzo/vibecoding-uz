import { describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({ db: {}, withTransactionLock: vi.fn() }));

import { withTransactionLock } from "@/db";
import { insertNextAttempt, isUniqueViolation, upsertLessonProgress } from "@/features/mobile/server/mobile.repository";
import { createTransaction } from "@/features/payments/server/payme.service";
import type { PaymentsRepository } from "@/features/payments/server/payments.repository";

type Row = { userId: string; lessonId: string; positionSec: number; completedAt: Date | null };

/** Minimal executor whose insert().values().onConflictDoUpdate() behaves like the unique index. */
function progressExecutor() {
  const rows = new Map<string, Row>();
  const calls = { select: 0 };
  const ex = {
    select: () => { calls.select++; throw new Error("saveProgress must not SELECT first"); },
    insert: () => ({
      values: (v: Row) => ({
        onConflictDoUpdate: async (cfg: { target: unknown[]; set: { positionSec: number; completedAt?: unknown } }) => {
          expect(cfg.target).toHaveLength(2);
          await new Promise((r) => setTimeout(r, 1)); // interleave the parallel calls
          const key = `${v.userId}:${v.lessonId}`;
          const current = rows.get(key);
          if (!current) rows.set(key, { ...v });
          else rows.set(key, { ...current, positionSec: cfg.set.positionSec, completedAt: cfg.set.completedAt ? current.completedAt ?? v.completedAt : current.completedAt });
        },
      }),
    }),
  };
  return { ex, rows, calls };
}

describe("F1: lesson_progress upsert", () => {
  it("two parallel saves for one (user, lesson) leave exactly one row and never SELECT first", async () => {
    const { ex, rows, calls } = progressExecutor();
    await Promise.all([
      upsertLessonProgress(ex as never, "u1", "l1", 10, false),
      upsertLessonProgress(ex as never, "u1", "l1", 20, true),
    ]);
    expect(rows.size).toBe(1);
    expect(calls.select).toBe(0);
    expect(rows.get("u1:l1")?.completedAt).toBeInstanceOf(Date);
  });
});

describe("F1: homework attempt_no", () => {
  it("isUniqueViolation sees 23505 on the error or its cause", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
    expect(isUniqueViolation(new Error("wrapped", { cause: { code: "23505" } }))).toBe(true);
    expect(isUniqueViolation({ code: "23503" })).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
  });

  it("insertNextAttempt uses max(attempt_no) + 1", async () => {
    const inserted: unknown[] = [];
    const ex = {
      select: () => ({ from: () => ({ where: () => ({ orderBy: () => ({ limit: async () => [{ attemptNo: 2 }] }) }) }) }),
      insert: () => ({ values: (v: { attemptNo: number }) => { inserted.push(v); return { returning: async () => [{ id: "s3" }] }; } }),
    };
    expect(await insertNextAttempt(ex as never, "u1", "a1", {})).toEqual({ id: "s3", attemptNo: 3 });
  });
});

describe("F1: Payme CreateTransaction locks the order, not the provider transaction", () => {
  it("uses payme-order:<orderId> for two different Payme transactions on one order", async () => {
    const lock = vi.mocked(withTransactionLock);
    lock.mockImplementation(async (_key, fn) => fn({} as never));
    const payment = { id: "o1", status: "pending", amountSum: "3000000", providerTxnId: null as string | null, meta: {} };
    const repo = {
      findPaymentByIdTx: async () => ({ ...payment }),
      setPaymentTx: async (_ex: unknown, _id: string, patch: { providerTxnId?: string }) => { payment.providerTxnId = patch.providerTxnId ?? null; },
      findByProviderTxnId: async () => null,
    } as unknown as PaymentsRepository;
    const first = await createTransaction(repo, "o1", "txn-A", 300_000_000, 1);
    const second = await createTransaction(repo, "o1", "txn-B", 300_000_000, 2);
    expect(lock.mock.calls.map((call) => call[0])).toEqual(["payme-order:o1", "payme-order:o1"]);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
  });
});
