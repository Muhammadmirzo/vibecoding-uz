import { NextRequest, NextResponse } from "next/server";
import { computeClickSign, createMerchantPrepareId, verifyClickSign } from "@/features/payments/click";
import { drizzlePaymentsRepository } from "@/features/payments/server/payments.repository";
import { handleClickWebhook } from "@/features/payments/server/click.service";
import { clickWebhookSchema } from "@/lib/validations/payment";
import { checkRateLimit, getClientIp, PRESETS } from "@/lib/security/rateLimit";

const repo = drizzlePaymentsRepository;

function protocolError(note: string, status = 400) {
  return NextResponse.json({ error: -1, error_note: note }, { status });
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.CLICK_SECRET_KEY?.trim();
  const serviceId = process.env.CLICK_SERVICE_ID?.trim();
  if (!secretKey || !serviceId) return protocolError("To'lov tizimi vaqtincha sozlanmagan", 503);

  try {
    const rl = await checkRateLimit(`click:${getClientIp(req)}`, PRESETS.WEBHOOK);
  if (!rl.success) return protocolError("Juda ko'p urinish, qayta urinib ko'ring", 429);

  const formData = await req.formData().catch(() => null);
  if (!formData) return protocolError("So'rov ma'lumotlari noto'g'ri", 400);
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) raw[key] = typeof value === "string" ? value : undefined;

  const parsed = clickWebhookSchema.safeParse(raw);
  if (!parsed.success) return protocolError("Tekshirilgan maydonlar yetishmaydi yoki noto'g'ri", 400);
  const data = parsed.data;
  if (data.service_id !== serviceId) return protocolError("Xizmat identifikatori mos emas", 401);

  const expectedSign = computeClickSign(
    data.click_trans_id, data.service_id, secretKey, data.merchant_trans_id,
    data.merchant_prepare_id, data.amount, data.action, data.sign_time,
  );
  if (!verifyClickSign(data.sign_string, expectedSign)) return protocolError("To'lov imzosi tekshirilmadi", 401);

  const outcome = await handleClickWebhook(repo, data, () => createMerchantPrepareId());
  if (!outcome.ok) return protocolError(outcome.note, outcome.status);
  return NextResponse.json(outcome.body);
  } catch (error) {
    console.error("Click webhook failed:", error);
    return protocolError("To'lov xizmati vaqtincha ishlamayapti. Qayta urinib ko'ring", 503);
  }
}
