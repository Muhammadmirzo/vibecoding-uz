import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/require-auth";
import { drizzleCertificatesRepository } from "@/features/certificates/server/certificates.repository";
import { getMyCertificate } from "@/features/certificates/server/certificates.service";
import { generateCertificatePdf } from "@/lib/certificates/pdf";

const querySchema = z.object({ code: z.string().min(3) });

export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({ code: url.searchParams.get("code") });
    if (!parsed.success) return NextResponse.json({ error: "Sertifikat kodi noto'g'ri" }, { status: 400 });

    const result = await getMyCertificate(drizzleCertificatesRepository, authResult.session.userId);
    if (result.status !== "issued" || result.certificate.code !== parsed.data.code) {
      return NextResponse.json({ error: "Sertifikat topilmadi" }, { status: 404 });
    }

    const pdf = await generateCertificatePdf({
      holderName: result.certificate.holderName,
      courseTitle: result.certificate.courseTitle,
      finalScore: result.certificate.finalScore,
      issuedAt: result.certificate.issuedAt,
      code: result.certificate.code,
    });
    const body = new Uint8Array(pdf);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sertifikat-${result.certificate.code}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/me/certificate/download error:", error);
    return NextResponse.json({ error: "PDF yaratishda xatolik yuz berdi" }, { status: 500 });
  }
}
