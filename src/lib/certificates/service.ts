import { eq } from "drizzle-orm";
import { db } from "@/db";
import { certificates, enrollments } from "@/db/schema";
import {
  issueCertificateSchema,
  verifyCertificateSchema,
  type IssueCertificateInput,
  type VerifyCertificateInput,
} from "@/lib/validations";
import { drizzleCertificatesRepository } from "@/features/certificates/server/certificates.repository";
import { getMyCertificate } from "@/features/certificates/server/certificates.service";

/**
 * Issues a certificate for an enrollment through the eligibility-gated
 * service (paid + lessons + homework + server-derived score). Throws when
 * the student is not eligible — there is no fallback default score.
 */
export async function issueCertificateForEnrollment(input: IssueCertificateInput) {
  const { enrollmentId } = issueCertificateSchema.parse(input);
  const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId)).limit(1);
  if (!enrollment) throw new Error("Enrollment record not found");

  const result = await getMyCertificate(drizzleCertificatesRepository, enrollment.userId, enrollmentId);
  if (result.status === "not_eligible") {
    throw new Error(`Sertifikat shartlari bajarilmagan: ${result.reasons.join("; ")}`);
  }
  if (result.status === "no_enrollment") throw new Error("Enrollment record not found");

  const [certificateRecord] = await db.select().from(certificates).where(eq(certificates.code, result.certificate.code)).limit(1);
  return { certificate: certificateRecord, pdfBuffer: null as Buffer | null };
}

/** Verifies a certificate by its unique code. */
export async function verifyCertificate(input: VerifyCertificateInput) {
  const { code } = verifyCertificateSchema.parse(input);
  const certs = await db
    .select()
    .from(certificates)
    .where(eq(certificates.code, code))
    .limit(1);
  return certs.length === 0 ? null : certs[0];
}
