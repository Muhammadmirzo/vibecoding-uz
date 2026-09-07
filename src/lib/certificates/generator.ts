import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { certificates, enrollments, users, courses, cohorts } from "../../db/schema";
import {
  generateCertificateSchema,
  issueCertificateSchema,
  verifyCertificateSchema,
  GenerateCertificateInput,
  IssueCertificateInput,
  VerifyCertificateInput,
} from "@/lib/validations";

/**
 * Generates a unique certificate code (e.g., VIBE-2026-7A9K2)
 */
export function generateUniqueCertificateCode(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomStr = "";
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VIBE-${year}-${randomStr}`;
}

/**
 * Generates an elegant PDF certificate buffer using pdf-lib.
 */
export async function generateCertificatePdf(
  input: GenerateCertificateInput
): Promise<Buffer> {
  const validated = generateCertificateSchema.parse(input);
  const { holderName, courseTitle, finalScore, issuedAt, code } = validated;

  const certCode = code || generateUniqueCertificateCode();
  const dateObj = issuedAt ? new Date(issuedAt) : new Date();
  const dateFormatted = dateObj.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create A4 Landscape Document (841.89 x 595.28 pt)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Load Standard Fonts
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Color Palette
  const bgCream = rgb(0.98, 0.97, 0.95);
  const darkInk = rgb(0.1, 0.12, 0.18);
  const accentGold = rgb(0.85, 0.65, 0.15);
  const borderNavy = rgb(0.08, 0.15, 0.32);
  const textMuted = rgb(0.4, 0.45, 0.52);

  // 1. Background Fill
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: bgCream,
  });

  // 2. Outer Navy Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: borderNavy,
    borderWidth: 3,
  });

  // 3. Inner Gold Frame
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: accentGold,
    borderWidth: 1.5,
  });

  // Helper for text centering
  const drawCenteredText = (
    text: string,
    y: number,
    size: number,
    font: typeof fontHelvetica,
    color = darkInk
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  // 4. Header Badge / Emblem
  drawCenteredText("MIRZO ACADEMY", height - 85, 14, fontHelveticaBold, accentGold);
  drawCenteredText("RASMIY TA'LIM SERTIFIKATI", height - 108, 11, fontHelvetica, textMuted);

  // 5. Main Title
  drawCenteredText("SERTIFIKAT", height - 170, 36, fontTimesBold, borderNavy);

  // 6. Presentation Text
  drawCenteredText(
    "Ushbu sertifikat egasi quyidagi kursni muvaffaqiyatli yakunlaganligini tasdiqlaydi:",
    height - 215,
    13,
    fontHelvetica,
    darkInk
  );

  // 7. Student Name
  drawCenteredText(holderName, height - 265, 28, fontHelveticaBold, borderNavy);

  // Decorative Gold Line under Name
  const nameWidth = fontHelveticaBold.widthOfTextAtSize(holderName, 28);
  const lineWidth = Math.max(nameWidth + 40, 200);
  page.drawLine({
    start: { x: (width - lineWidth) / 2, y: height - 275 },
    end: { x: (width + lineWidth) / 2, y: height - 275 },
    thickness: 2,
    color: accentGold,
  });

  // 8. Course Title & Grade
  drawCenteredText(`KURSNI NOMI: "${courseTitle.toUpperCase()}"`, height - 325, 16, fontHelveticaBold, darkInk);

  const scoreText = `Yakuniy Natija: ${finalScore} / 10 ball`;
  drawCenteredText(scoreText, height - 355, 13, fontHelveticaBold, accentGold);

  // 9. Footer Info (Date & Signature Lines)
  // Left: Issue Date
  page.drawText("Berilgan vaqti:", { x: 70, y: 110, size: 10, font: fontHelvetica, color: textMuted });
  page.drawText(dateFormatted, { x: 70, y: 92, size: 12, font: fontHelveticaBold, color: darkInk });

  // Right: Signature
  const rightX = width - 240;
  page.drawText("Platforma Rahiari:", { x: rightX, y: 110, size: 10, font: fontHelvetica, color: textMuted });
  page.drawText("Mirzo Academy Team", { x: rightX, y: 92, size: 12, font: fontHelveticaBold, color: darkInk });
  page.drawLine({
    start: { x: rightX, y: 85 },
    end: { x: rightX + 170, y: 85 },
    thickness: 1,
    color: textMuted,
  });

  // 10. Bottom Verification Code & URL
  const codeText = `Sertifikat ID: ${certCode}`;
  page.drawText(codeText, {
    x: 70,
    y: 50,
    size: 10,
    font: fontHelveticaBold,
    color: borderNavy,
  });

  const verifyUrl = `https://academy.mirzo.uz/shahodatnoma/${certCode}`;
  const verifyText = `Haqiqiyligini tekshirish: ${verifyUrl}`;
  const verifyWidth = fontHelvetica.widthOfTextAtSize(verifyText, 9);
  page.drawText(verifyText, {
    x: width - verifyWidth - 70,
    y: 50,
    size: 9,
    font: fontHelvetica,
    color: textMuted,
  });

  // Save PDF as Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Issues a certificate for an enrollment and saves it into the DB.
 */
export async function issueCertificateForEnrollment(input: IssueCertificateInput) {
  const validated = issueCertificateSchema.parse(input);
  const { enrollmentId } = validated;

  // 1. Fetch enrollment, user, cohort, and course
  const records = await db
    .select({
      enrollment: enrollments,
      user: users,
      cohort: cohorts,
      course: courses,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
    .innerJoin(courses, eq(cohorts.courseId, courses.id))
    .where(eq(enrollments.id, enrollmentId))
    .limit(1);

  if (records.length === 0) {
    throw new Error("Enrollment record not found");
  }

  const { enrollment, user, course } = records[0];

  // 2. Check if certificate already exists
  const existingCerts = await db
    .select()
    .from(certificates)
    .where(eq(certificates.enrollmentId, enrollmentId))
    .limit(1);

  let certCode = existingCerts[0]?.code || generateUniqueCertificateCode();
  const finalScore = enrollment.finalScore
    ? parseFloat(enrollment.finalScore)
    : 9.5;

  // 3. Generate PDF Buffer
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

  // Update enrollment with code and score
  await db
    .update(enrollments)
    .set({
      certificateCode: certCode,
      finalScore: finalScore.toString(),
      status: "finished",
    })
    .where(eq(enrollments.id, enrollmentId));

  return {
    certificate: certificateRecord,
    pdfBuffer,
  };
}

/**
 * Verifies a certificate by its unique code.
 */
export async function verifyCertificate(input: VerifyCertificateInput) {
  const validated = verifyCertificateSchema.parse(input);
  const { code } = validated;

  const certs = await db
    .select()
    .from(certificates)
    .where(eq(certificates.code, code))
    .limit(1);

  if (certs.length === 0) {
    return null;
  }

  return certs[0];
}
