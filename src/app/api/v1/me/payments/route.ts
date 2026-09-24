import { z } from "zod";
import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { paymentItemSchema } from "@/features/mobile/contracts-resources";
import { listUserPayments } from "@/features/payments/server/payments.repository";

registerV1Route({
  method: "get",
  path: "/api/v1/me/payments",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["me"],
  summary: "Mening to'lovlarim",
  responses: {
    200: { description: "To'lovlar", content: { "application/json": { schema: z.object({ items: z.array(paymentItemSchema) }) } } },
  },
});

export async function GET(request: Request) {
  return v1(request, async ({ session }) => {
    const rows = await listUserPayments(session.userId);
    return ok({
      items: rows.map((row) => ({
        id: row.id, provider: row.provider, amountSum: String(row.amountSum),
        currency: "UZS" as const, status: row.status,
        paidAt: row.paidAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(), enrollmentId: row.enrollmentId,
      })),
    });
  });
}
