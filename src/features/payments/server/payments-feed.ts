import {
  isClickAvailable,
  isPaymeAvailable,
  readProviderSecrets,
} from "../domain/policy";
import type { PaymentRecord, PaymentsResponse } from "../format";
import { listUserPayments } from "./payments.repository";

/**
 * One source of truth for the payment feed shape: the cabinet page (server
 * prefetch) and GET /api/me/payments must return the same envelope, or the
 * client has to parse two contracts (L7).
 */
export async function loadStudentPaymentsFeed(
  userId: string,
): Promise<PaymentsResponse> {
  const secrets = readProviderSecrets();
  const rows = await listUserPayments(userId);
  const payments: PaymentRecord[] = rows.map((row) => ({
    id: row.id,
    provider: row.provider as PaymentRecord["provider"],
    providerTxnId: row.providerTxnId,
    amountSum: String(row.amountSum),
    status: row.status as PaymentRecord["status"],
    paidAt: row.paidAt?.toISOString() ?? null,
    receiptUrl: row.receiptUrl,
    createdAt: row.createdAt.toISOString(),
    enrollmentId: row.enrollmentId,
  }));
  return {
    payments,
    providers: { payme: isPaymeAvailable(secrets), click: isClickAvailable(secrets) },
  };
}
