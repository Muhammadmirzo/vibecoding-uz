import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { getAuthSession } from "@/lib/auth/session";

const paymentResponseSchema = z.object({
  id: z.string().uuid(),
  provider: z.enum(["payme", "click", "manual"]),
  providerTxnId: z.string().nullable(),
  amountSum: z.string(),
  status: z.enum(["pending", "paid", "failed", "refunded"]),
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
    const authSession = await getAuthSession();
    if (!authSession) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan" },
        { status: 401 }
      );
    }

    const rows = await db
      .select({
        id: payments.id,
        provider: payments.provider,
        providerTxnId: payments.providerTxnId,
        amountSum: payments.amountSum,
        status: payments.status,
        paidAt: payments.paidAt,
        receiptUrl: payments.receiptUrl,
        createdAt: payments.createdAt,
        enrollmentId: payments.enrollmentId,
      })
      .from(payments)
      .where(eq(payments.userId, authSession.userId))
      .orderBy(desc(payments.createdAt));

    const result = paymentsResponseSchema.parse({
      payments: rows.map((row) => ({
        ...row,
        amountSum: String(row.amountSum),
        paidAt: row.paidAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      })),
      providers: {
        payme: Boolean(process.env.PAYME_MERCHANT_ID),
        click: Boolean(
          process.env.CLICK_SERVICE_ID && process.env.CLICK_MERCHANT_ID
        ),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/me/payments error:", error);
    return NextResponse.json(
      { error: "To'lovlarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
