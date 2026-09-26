import { NextResponse } from "next/server";
import { z } from "zod";
import { loadStudentPaymentsFeed } from "@/features/payments/server/payments-feed";
import { getDbSession } from "@/lib/auth/require-auth";
import { errorResponse } from "@/lib/http/errors";

const paymentResponseSchema = z.object({
  id: z.string().uuid(),
  provider: z.enum(["payme", "click", "manual"]),
  providerTxnId: z.string().nullable(),
  amountSum: z.string(),
  status: z.enum(["pending", "paid", "failed", "refunded", "cancelled"]),
  paidAt: z.string().datetime().nullable(),
  receiptUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  enrollmentId: z.string().uuid().nullable(),
});

const paymentsResponseSchema = z.object({
  payments: z.array(paymentResponseSchema),
  providers: z.object({
    payme: z.boolean(),
    click: z.boolean(),
  }),
});

export async function GET() {
  try {
    const authSession = await getDbSession();
    if (!authSession) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan" },
        { status: 401 }
      );
    }

    const feed = await loadStudentPaymentsFeed(authSession.userId);
    return NextResponse.json(paymentsResponseSchema.parse(feed));
  } catch (error) {
    return errorResponse(error);
  }
}
