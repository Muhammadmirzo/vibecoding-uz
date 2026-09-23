import { generateCertificateSchema, type GenerateCertificateInput } from "@/lib/validations";

export interface CertificateTemplateData {
  holderName: string;
  courseTitle: string;
  finalScore: number | string;
  dateFormatted: string;
  certCode: string;
}

/** Generates a unique certificate code (e.g., VIBE-2026-7A9K2). */
export function generateUniqueCertificateCode(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomStr = "";
  for (let index = 0; index < 5; index++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `VIBE-${year}-${randomStr}`;
}

export function prepareCertificateTemplate(input: GenerateCertificateInput): CertificateTemplateData {
  const validated = generateCertificateSchema.parse(input);
  const certCode = validated.code || generateUniqueCertificateCode();
  const dateObj = validated.issuedAt ? new Date(validated.issuedAt) : new Date();
  return {
    holderName: validated.holderName,
    courseTitle: validated.courseTitle,
    finalScore: validated.finalScore,
    dateFormatted: dateObj.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    certCode,
  };
}
