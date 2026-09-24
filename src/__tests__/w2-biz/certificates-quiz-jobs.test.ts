import { describe, expect, it, vi } from "vitest";
import { evaluateEligibility } from "@/features/certificates/domain/policy";
import { getMyCertificate } from "@/features/certificates/server/certificates.service";
import type { CertificatesRepository, CertificateProgress } from "@/features/certificates/server/certificates.repository";
import { validateQuizAnswers, recomputeQuizResult } from "@/features/quiz/domain/validation";
import { applyForJob, JobApplyError } from "@/features/jobs/server/apply.service";
import type { JobApplicationsRepository } from "@/features/jobs/server/apply.service";

describe("certificate eligibility policy", () => {
  const eligible = {
    isPaid: true, requiredLessons: 10, completedLessons: 10,
    assignmentsTotal: 4, assignmentsPassed: 4, averageScore: 8.5,
  };
  it("passes when every gate is met and keeps the server score", () => {
    expect(evaluateEligibility(eligible)).toEqual({ eligible: true, reasons: [], score: 8.5 });
  });
  it("fails without a settled payment", () => {
    const outcome = evaluateEligibility({ ...eligible, isPaid: false });
    expect(outcome.eligible).toBe(false);
    expect(outcome.reasons.length).toBeGreaterThan(0);
  });
  it("fails on incomplete lessons or homework", () => {
    expect(evaluateEligibility({ ...eligible, completedLessons: 9 }).eligible).toBe(false);
    expect(evaluateEligibility({ ...eligible, assignmentsPassed: 3 }).eligible).toBe(false);
  });
  it("never invents a score: null average fails", () => {
    expect(evaluateEligibility({ ...eligible, averageScore: null }).eligible).toBe(false);
    expect(evaluateEligibility({ ...eligible, averageScore: 6.9 }).eligible).toBe(false);
  });
});

describe("certificate service wiring", () => {
  const progress = (overrides: Partial<CertificateProgress> = {}): CertificateProgress => ({
    enrollmentId: "enr-1", userId: "user-1", fullName: "Ali Valiyev",
    courseTitle: "Vibe Coding Express", enrolledAt: new Date(),
    isPaid: true, requiredLessons: 2, completedLessons: 2,
    assignmentsTotal: 1, assignmentsPassed: 1, averageScore: 8.25,
    existingCode: null, existingIssuedAt: null, ...overrides,
  });
  const repo = (p: CertificateProgress | null): CertificatesRepository => ({
    loadProgress: async () => p,
    saveCertificate: async (input) => ({
      id: "cert-1", enrollmentId: input.enrollmentId, code: input.code,
      holderName: input.holderName, courseTitle: input.courseTitle,
      finalScore: input.finalScore, issuedAt: new Date(), pdfUrl: input.pdfUrl,
    }),
    markEnrollmentFinished: async () => undefined,
  });

  it("issues with the mentor-derived score", async () => {
    const result = await getMyCertificate(repo(progress()), "user-1");
    expect(result.status).toBe("issued");
    if (result.status === "issued") expect(result.certificate.finalScore).toBe(8.25);
  });
  it("returns an empty-state payload when not eligible", async () => {
    const result = await getMyCertificate(repo(progress({ isPaid: false })), "user-1");
    expect(result.status).toBe("not_eligible");
  });
  it("returns no_enrollment without rows", async () => {
    expect((await getMyCertificate(repo(null), "user-1")).status).toBe("no_enrollment");
  });
});

describe("quiz server validation", () => {
  it("accepts a complete answer set and recomputes server-side", () => {
    const checked = validateQuizAnswers({ 0: 0, 1: 1, 2: 0, 3: 0, 4: 0 });
    expect(checked.ok).toBe(true);
    if (checked.ok) {
      const result = recomputeQuizResult(checked.answers);
      expect(result.recommendedCourse).toBe("vibe-coding-express");
      expect(result.scores.total).toBeGreaterThan(0);
      expect(result.reasoning).toHaveLength(5);
    }
  });
  it("rejects missing answers", () => {
    expect(validateQuizAnswers({ 0: 0 }).ok).toBe(false);
  });
  it("rejects out-of-range option indexes", () => {
    expect(validateQuizAnswers({ 0: 0, 1: 1, 2: 0, 3: 0, 4: 99 }).ok).toBe(false);
  });
  it("rejects non-object payloads", () => {
    expect(validateQuizAnswers(null).ok).toBe(false);
    expect(validateQuizAnswers("x").ok).toBe(false);
  });
});

describe("job application service", () => {
  const repo = (recent: boolean): JobApplicationsRepository => ({
    findDbOpening: async (id: string) =>
      id === "11111111-1111-4111-8111-111111111111" ? { id, title: "Mentor", status: "active" } : null,
    hasRecentApplication: async () => recent,
    insertApplication: async () => ({ id: "lead-1" }),
    recordAudit: async () => undefined,
  });
  const base = {
    jobTitle: "Senior Vibe Coding Mentor", fullName: "Ali Valiyev", phone: "+998901234567",
  };
  it("accepts a static-listing slug", async () => {
    const outcome = await applyForJob(repo(false), { ...base, jobSlug: "senior-vibe-coding-mentor" }, "127.0.0.1");
    expect(outcome).toEqual({ leadId: "lead-1" });
  });
  it("accepts a DB opening UUID", async () => {
    const outcome = await applyForJob(
      repo(false), { ...base, jobId: "11111111-1111-4111-8111-111111111111" }, "127.0.0.1",
    );
    expect(outcome).toEqual({ leadId: "lead-1" });
  });
  it("rejects an unknown opening", async () => {
    await expect(applyForJob(repo(false), { ...base, jobSlug: "nope" }, "127.0.0.1")).rejects.toBeInstanceOf(JobApplyError);
    await expect(
      applyForJob(repo(false), { ...base, jobId: "22222222-2222-4222-8222-222222222222" }, "127.0.0.1"),
    ).rejects.toMatchObject({ code: "UNKNOWN_JOB" });
  });
  it("dedupes the same phone within 24h with 409 semantics", async () => {
    await expect(
      applyForJob(repo(true), { ...base, jobSlug: "senior-vibe-coding-mentor" }, "127.0.0.1"),
    ).rejects.toMatchObject({ code: "DUPLICATE" });
  });
  it("requires a job reference", async () => {
    await expect(applyForJob(repo(false), { ...base }, "127.0.0.1")).rejects.toMatchObject({ code: "UNKNOWN_JOB" });
  });
});

vi.mock("@/db", () => ({}));
