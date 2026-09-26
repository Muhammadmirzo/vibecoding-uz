import { randomInt } from "node:crypto";
import { generateCertificateSchema, type GenerateCertificateInput } from "@/lib/validations";

/** Unambiguous alphabet: no I, O, 0, 1 — a code is read aloud and typed by hand. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
/** Random part length. Format: NAQSH-<year>-XXXXXXXX. */
export const CODE_RANDOM_LENGTH = 8;

export interface CertificateTemplateData {
  holderName: string;
  courseTitle: string;
  finalScore: number | string;
  dateFormatted: string;
  certCode: string;
}

/**
 * Generates a unique certificate code, e.g. `NAQSH-2026-7A9K2M4Q`.
 * CSPRNG (`node:crypto` randomInt) — `Math.random` is forbidden for tokens/OTP
 * and a certificate code is a public trust artefact (CODER_AGENT_RULES §6).
 */
export function generateUniqueCertificateCode(): string {
  const year = new Date().getFullYear();
  let randomStr = "";
  for (let index = 0; index < CODE_RANDOM_LENGTH; index++) {
    randomStr += CODE_ALPHABET.charAt(randomInt(0, CODE_ALPHABET.length));
  }
  return `NAQSH-${year}-${randomStr}`;
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
