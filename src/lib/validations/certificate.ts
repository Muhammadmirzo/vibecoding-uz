import { z } from "zod";

export const generateCertificateSchema = z.object({
  holderName: z.string().min(2, { message: "Talaba F.I.SH. kamida 2 ta belgidan iborat bo'lishi kerak" }),
  courseTitle: z.string().min(2, { message: "Kurs nomi kiritilishi shart" }),
  finalScore: z.union([z.number(), z.string()]),
  issuedAt: z.union([z.date(), z.string()]).optional(),
  code: z.string().optional(),
});

export const issueCertificateSchema = z.object({
  enrollmentId: z.string().uuid({ message: "A'zolik ID si noto'g'ri" }),
});

export const verifyCertificateSchema = z.object({
  code: z.string().min(3, { message: "Sertifikat kodi noto'g'ri" }),
});

export type GenerateCertificateInput = z.infer<typeof generateCertificateSchema>;
export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
export type VerifyCertificateInput = z.infer<typeof verifyCertificateSchema>;
