import { eq } from "drizzle-orm";
import { db } from "@/db";
import { certificates, enrollments, users, courses, cohorts } from "@/db/schema";
import {
  issueCertificateSchema,
  verifyCertificateSchema,
  type IssueCertificateInput,
  type VerifyCertificateInput,
} from "@/lib/validations";
import { generateCertificatePdf } from "./pdf";
import { generateUniqueCertificateCode } from "./template";

/** Issues a certificate for an enrollment and saves it into the database. */
export async function issueCertificateForEnrollment(input: IssueCertificateInput) {
  const { enrollmentId } = issueCertificateSchema.parse(input);
  const records = await db
    .select({ enrollment: enrollments, user: users, cohort: cohorts, course: courses })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
    .innerJoin(courses, eq(cohorts.courseId, courses.id))
    .where(eq(enrollments.id, enrollmentId))
    .limit(1);

  if (records.length === 0) throw new Error("Enrollment record not found");

  const { enrollment, user, course } = records[0];
  const existingCerts = await db
    .select()
    .from(certificates)
    .where(eq(certificates.enrollmentId, enrollmentId))
    .limit(1);

  const certCode = existingCerts[0]?.code || generateUniqueCertificateCode();
  const finalScore = enrollment.finalScore ? parseFloat(enrollment.finalScore) : 9.5;
  const pdfBuffer = await generateCertificatePdf({
    holderName: user.fullName,
    courseTitle: course.title,
    finalScore,
    code: certCode,
    issuedAt: existingCerts[0]?.issuedAt || new Date(),
  });
  const pdfUrl = `/api/certificates/download/${certCode}`;

  let certificateRecord;
  if (existingCerts.length > 0) {
    const updated = await db
      .update(certificates)
      .set({
        holderName: user.fullName,
        courseTitle: course.title,
        finalScore: finalScore.toString(),
        pdfUrl,
      })
      .where(eq(certificates.id, existingCerts[0].id))
      .returning();
    certificateRecord = updated[0];
  } else {
    const inserted = await db
      .insert(certificates)
      .values({
        enrollmentId,
        code: certCode,
        holderName: user.fullName,
        courseTitle: course.title,
        finalScore: finalScore.toString(),
        pdfUrl,
      })
      .returning();
    certificateRecord = inserted[0];
  }

  await db
    .update(enrollments)
    .set({
      certificateCode: certCode,
      finalScore: finalScore.toString(),
      status: "finished",
    })
    .where(eq(enrollments.id, enrollmentId));

  return { certificate: certificateRecord, pdfBuffer };
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
