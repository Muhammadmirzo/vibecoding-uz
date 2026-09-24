import { BRAND } from "@/config/brand";
import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { referralSchema } from "@/features/mobile/contracts-resources";
import { drizzleReferralsRepository } from "@/features/referrals/server/referrals.repository";
import { codeOfUserId } from "@/features/referrals/domain/referral-code";

registerV1Route({
  method: "get",
  path: "/api/v1/me/referral",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["me"],
  summary: "Mening referal kodim va balansim",
  responses: {
    200: { description: "Referal", content: { "application/json": { schema: referralSchema } } },
  },
});

export async function GET(request: Request) {
  return v1(request, async ({ session }) => {
    const balance = await drizzleReferralsRepository.loadBalance(session.userId);
    const code = codeOfUserId(session.userId);
    return ok({
      code, deepLink: `${BRAND.url}/ref/${code}`,
      earnedTiyin: balance.earnedTiyin, earnedSum: Math.round(balance.earnedTiyin / 100),
      balanceTiyin: balance.balanceTiyin,
      referredPaidCount: balance.referredPaidCount, currency: "UZS" as const,
    });
  });
}
