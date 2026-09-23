import { createHash, timingSafeEqual } from "node:crypto";

export interface ClickTransactionRecord {
  clickTransId: number;
  merchantTransId: string;
  merchantPrepareId: number;
  merchantConfirmId?: number;
  amount: number;
  status: "prepared" | "completed" | "failed";
  createdAt: number;
}

export function computeClickSign(
  clickTransId: string,
  serviceId: string,
  secretKey: string,
  merchantTransId: string,
  merchantPrepareId: string,
  amount: string,
  action: string,
  signTime: string
): string {
  const source = `${clickTransId}${serviceId}${secretKey}${merchantTransId}${merchantPrepareId || ""}${amount}${action}${signTime}`;
  return createHash("md5").update(source).digest("hex");
}

export function verifyClickSign(received: string, expected: string): boolean {
  if (!/^[a-fA-F0-9]{32}$/.test(received) || !/^[a-fA-F0-9]{32}$/.test(expected)) return false;
  return timingSafeEqual(Buffer.from(received.toLowerCase(), "hex"), Buffer.from(expected.toLowerCase(), "hex"));
}

export function clickAmountMatches(expectedSum: string, receivedAmount: string): boolean {
  if (!/^\d+(?:\.\d{1,2})?$/.test(expectedSum) || !/^\d+(?:\.\d{1,2})?$/.test(receivedAmount)) return false;
  const expected = Number(expectedSum) * 100;
  const received = Number(receivedAmount) * 100;
  return Number.isSafeInteger(expected) && Number.isSafeInteger(received) && expected === received;
}

export function createMerchantPrepareId(nowMs = Date.now()): number {
  return Math.floor(nowMs / 1000) + Math.floor(Math.random() * 1_000_000);
}

/** Compatibility no-op: webhook idempotency is persisted in PostgreSQL. */
export const clickStore = { clear: (): void => undefined };
