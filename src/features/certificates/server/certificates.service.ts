import { randomUUID } from "node:crypto";
import { evaluateEligibility } from "../domain/policy";
import type { CertificatesRepository } from "./certificates.repository";

export interface CertificateReadModel {
  code: string;
  holderName: string;
  courseTitle: string;
  finalScore: number;
  issuedAt: Date;
  downloadUrl: string;
}

export type CertificateResult =
  | { status: "issued"; certificate: CertificateReadModel }
  | { status: "not_eligible"; reasons: string[]; progress: { requiredLessons: number; completedLessons: number; assignmentsTotal: number; assignmentsPassed: number } }
  | { status: "no_enrollment" };

function toCode(): string {
  return `VC-${new Date().getFullYear()}-${randomUUID().slice(0, 5).toUpperCase().replace(/-/g, "X")}`;
}

/**
 * Loads the student's real certificate state: existing certificate, or
 * eligibility-gated issuance. Scores always come from mentor reviews —
 * there is no fallback default.
 */
export async function getMyCertificate(
  repo: CertificatesRepository,
  userId: string,
  enrollmentId?: string,
): Promise<CertificateResult> {
  const progress = await repo.loadProgress(userId, enrollmentId);
  if (!progress) return { status: "no_enrollment" };

  const eligibility = evaluateEligibility(progress);
  if (!eligibility.eligible || eligibility.score === null) {
    return {
      status: "not_eligible",
      reasons: eligibility.reasons,
      progress: {
        requiredLessons: progress.requiredLessons,
        completedLessons: progress.completedLessons,
        assignmentsTotal: progress.assignmentsTotal,
        assignmentsPassed: progress.assignmentsPassed,
      },
    };
  }

  const code = progress.existingCode ?? toCode();
  const saved = await repo.saveCertificate({
    enrollmentId: progress.enrollmentId,
    code,
    holderName: progress.fullName,
    courseTitle: progress.courseTitle,
    finalScore: eligibility.score.toFixed(2),
    pdfUrl: `/api/me/certificate/download?code=${code}`,
  });
  await repo.markEnrollmentFinished(progress.enrollmentId, code, eligibility.score.toFixed(2));

  return {
    status: "issued",
    certificate: {
      code: saved.code,
      holderName: saved.holderName,
      courseTitle: saved.courseTitle,
      finalScore: Number(saved.finalScore),
      issuedAt: saved.issuedAt,
      downloadUrl: `/api/me/certificate/download?code=${saved.code}`,
    },
  };
}
