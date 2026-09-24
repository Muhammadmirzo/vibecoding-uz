import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { drizzleCertificatesRepository } from "@/features/certificates/server/certificates.repository";
import { getMyCertificate } from "@/features/certificates/server/certificates.service";

export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;
  try {
    const result = await getMyCertificate(drizzleCertificatesRepository, authResult.session.userId);
    if (result.status === "no_enrollment") {
      return NextResponse.json({ success: true, status: "no_enrollment" });
    }
    if (result.status === "not_eligible") {
      return NextResponse.json({ success: true, status: "not_eligible", reasons: result.reasons, progress: result.progress });
    }
    return NextResponse.json({ success: true, status: "issued", certificate: result.certificate });
  } catch (error) {
    console.error("GET /api/me/certificate error:", error);
    return NextResponse.json({ error: "Sertifikatni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}
