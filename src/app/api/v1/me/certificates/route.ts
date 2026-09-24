import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { certificateSchema } from "@/features/mobile/contracts-resources";
import { drizzleCertificatesRepository } from "@/features/certificates/server/certificates.repository";
import { getMyCertificate } from "@/features/certificates/server/certificates.service";

registerV1Route({
  method: "get",
  path: "/api/v1/me/certificates",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["me"],
  summary: "Mening sertifikatim",
  responses: {
    200: { description: "Sertifikat holati", content: { "application/json": { schema: certificateSchema } } },
  },
});

export async function GET(request: Request) {
  return v1(request, async ({ session }) => {
    const result = await getMyCertificate(drizzleCertificatesRepository, session.userId);
    if (result.status === "no_enrollment") return ok({ status: "no_enrollment" as const, certificate: null });
    if (result.status === "not_eligible") {
      return ok({
        status: "not_eligible" as const, certificate: null,
        reasons: result.reasons,
        progress: result.progress,
      });
    }
    return ok({
      status: "issued" as const,
      certificate: { ...result.certificate, issuedAt: result.certificate.issuedAt.toISOString() },
    });
  });
}
