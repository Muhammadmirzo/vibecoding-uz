import { NextResponse } from "next/server";
import { z } from "zod";
import { listUserPayments } from "@/features/payments/server/payments.repository";
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

    const rows = await listUserPayments(authSession.userId);

    const result = paymentsResponseSchema.parse({
      payments: rows.map((row) => ({
        ...row,
        amountSum: String(row.amountSum),
        paidAt: row.paidAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      })),
      providers: {
        payme: Boolean(process.env.PAYME_MERCHANT_ID?.trim()) && Boolean(process.env.PAYME_KEY?.trim()),
        click: Boolean(
          process.env.CLICK_SERVICE_ID?.trim() && process.env.CLICK_MERCHANT_ID?.trim() && process.env.CLICK_SECRET_KEY?.trim()
        ),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
