import { eq } from "drizzle-orm";
import { db } from "@/db";
import { certificates, cohorts, courses, enrollments, users } from "@/db/schema";
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

export interface CertificateOwner {
  /**
   * Real student name (users.full_name), falling back to the holder name
   * snapshotted onto the certificate at issuance. NEVER a phone number: this
   * page is public and unauthenticated, so no PII beyond the printed name.
   */
  holderName: string;
  courseTitle: string;
  /** Server-derived score written at issuance; null when no finite number is stored. */
  score: number | null;
  issuedAt: Date;
}

/**
 * Loads the display data behind an already-verified certificate row: the
 * student's own record and the course they were enrolled in. Falls back to the
 * immutable values snapshotted onto the certificate at issuance so a
 * verification page can never render an empty or invented field.
 */
export async function loadCertificateOwner(
  certificate: typeof certificates.$inferSelect,
): Promise<CertificateOwner> {
  // PII: `users.phone` is deliberately NOT selected — the public verification page
  // must never render (nor fall back to) a phone number.
  const [row] = await db
    .select({
      fullName: users.fullName,
      courseTitle: courses.title,
      enrollmentScore: enrollments.finalScore,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .leftJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
    .leftJoin(courses, eq(cohorts.courseId, courses.id))
    .where(eq(enrollments.id, certificate.enrollmentId))
    .limit(1);

  const stored = Number(certificate.finalScore);
  const enrollment = Number(row?.enrollmentScore);

  return {
    holderName: row?.fullName || certificate.holderName || "",
    courseTitle: row?.courseTitle || certificate.courseTitle,
    score: Number.isFinite(stored) ? stored : Number.isFinite(enrollment) ? enrollment : null,
    issuedAt: certificate.issuedAt,
  };
}
