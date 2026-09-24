import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateMyProfile, changeMyPassword } from "@/features/crm/server/profile.service";
import type {
  DbExecutor, MeRecord, ProfileRepository,
} from "@/features/crm/server/profile.repository";
import { updateMyProfileSchema } from "@/lib/validations/student";
import { getMyCertificate } from "@/features/certificates/server/certificates.service";
import type {
  CertificateProgress, CertificatesRepository, DbExecutor as CertDbExecutor,
} from "@/features/certificates/server/certificates.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

const ME: MeRecord = {
  id: "u-1", phone: "+998901234567", email: "a@example.com", fullName: "Ali Valiyev",
  avatarUrl: null, role: "student", locale: "uz",
  createdAt: new Date("2026-01-01T00:00:00Z"), lastLoginAt: null,
  profile: { birthDate: null, city: "Toshkent", profession: null, goal: null, source: null, bio: null },
};

function profileRepo(calls: string[]): ProfileRepository {
  return {
    findMe: async () => ({ ...ME }),
    findPasswordHash: async () => ({ id: "u-1", passwordHash: "salt:hash" }),
    setPasswordHash: async () => { calls.push("setPasswordHash"); },
    updateUserFields: async () => { calls.push("updateUserFields"); },
    updateUserFieldsTx: async (_ex: DbExecutor) => { calls.push("updateUserFieldsTx"); },
    upsertProfileFields: async () => { calls.push("upsertProfileFields"); },
    upsertProfileFieldsTx: async (_ex: DbExecutor) => { calls.push("upsertProfileFieldsTx"); },
  };
}

const HASHER = {
  hash: async (password: string) => `hashed:${password}`,
  verify: async (password: string, stored: string) => stored === `hashed:${password}` || (password === "current" && stored === "salt:hash"),
};

describe("updateMyProfileSchema", () => {
  it("accepts partial updates and empty-string clears", () => {
    const parsed = updateMyProfileSchema.parse({ fullName: "Ali Valiyev", email: "", city: "Samarqand" });
    expect(parsed).toMatchObject({ fullName: "Ali Valiyev", email: "", city: "Samarqand" });
  });
  it("rejects short names and bad emails", () => {
    expect(updateMyProfileSchema.safeParse({ fullName: "A" }).success).toBe(false);
    expect(updateMyProfileSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});

describe("updateMyProfile service", () => {
  let calls: string[];
  beforeEach(() => { calls = []; });
  it("writes user + profile tables atomically via Tx methods", async () => {
    const out = await updateMyProfile(profileRepo(calls), "u-1", { fullName: "Ali V.", city: "Buxoro" });
    expect(calls).toEqual(["updateUserFieldsTx", "upsertProfileFieldsTx"]);
    expect(out.id).toBe("u-1");
  });
  it("touches only the tables that received fields", async () => {
    await updateMyProfile(profileRepo(calls), "u-1", { city: "Buxoro" });
    expect(calls).toEqual(["upsertProfileFieldsTx"]);
  });
  it("throws NOT_FOUND when the user vanished", async () => {
    const missing: ProfileRepository = { ...profileRepo(calls), findMe: async () => null };
    await expect(updateMyProfile(missing, "u-1", { city: "X" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("changeMyPassword service", () => {
  it("verifies the current password then sets the new hash", async () => {
    const calls: string[] = [];
    await changeMyPassword(profileRepo(calls), HASHER, "u-1", {
      currentPassword: "current", newPassword: "newpass123", confirmPassword: "newpass123",
    });
    expect(calls).toEqual(["setPasswordHash"]);
  });
  it("rejects a wrong current password without writing", async () => {
    const calls: string[] = [];
    await expect(changeMyPassword(profileRepo(calls), HASHER, "u-1", {
      currentPassword: "wrong", newPassword: "newpass123", confirmPassword: "newpass123",
    })).rejects.toMatchObject({ code: "BAD_PASSWORD" });
    expect(calls).toEqual([]);
  });
  it("skips verification for passwordless (OTP) accounts", async () => {
    const calls: string[] = [];
    const noHash: ProfileRepository = {
      ...profileRepo(calls), findPasswordHash: async () => ({ id: "u-1", passwordHash: null }),
    };
    await changeMyPassword(noHash, HASHER, "u-1", {
      currentPassword: "anything", newPassword: "newpass123", confirmPassword: "newpass123",
    });
    expect(calls).toEqual(["setPasswordHash"]);
  });
});

describe("certificate issuance transaction", () => {
  const progress: CertificateProgress = {
    enrollmentId: "enr-1", userId: "u-1", fullName: "Ali Valiyev",
    courseTitle: "Vibe Coding Express", enrolledAt: new Date(),
    isPaid: true, requiredLessons: 2, completedLessons: 2,
    assignmentsTotal: 1, assignmentsPassed: 1, averageScore: 8.25,
    existingCode: null, existingIssuedAt: null,
  };
  const savedRow = {
    id: "cert-1", enrollmentId: "enr-1", code: "VC-2026-ABCDE",
    holderName: "Ali Valiyev", courseTitle: "Vibe Coding Express",
    finalScore: "8.25", issuedAt: new Date(), pdfUrl: "/api/me/certificate/download?code=VC-2026-ABCDE",
  };
  it("uses the atomic Tx path when the repository supports it", async () => {
    const calls: string[] = [];
    const repo: CertificatesRepository = {
      loadProgress: async () => ({ ...progress }),
      saveCertificate: async () => { calls.push("saveCertificate"); return { ...savedRow }; },
      markEnrollmentFinished: async () => { calls.push("markEnrollmentFinished"); },
      saveCertificateTx: async (_ex: CertDbExecutor) => { calls.push("saveCertificateTx"); return { ...savedRow }; },
      markEnrollmentFinishedTx: async () => { calls.push("markEnrollmentFinishedTx"); },
    };
    const result = await getMyCertificate(repo, "u-1");
    expect(result.status).toBe("issued");
    expect(calls).toEqual(["saveCertificateTx", "markEnrollmentFinishedTx"]);
  });
  it("falls back to sequential writes for legacy repositories", async () => {
    const calls: string[] = [];
    const repo: CertificatesRepository = {
      loadProgress: async () => ({ ...progress }),
      saveCertificate: async (input) => { calls.push("saveCertificate"); return { ...savedRow, code: input.code }; },
      markEnrollmentFinished: async () => { calls.push("markEnrollmentFinished"); },
    };
    const result = await getMyCertificate(repo, "u-1");
    expect(result.status).toBe("issued");
    expect(calls).toEqual(["saveCertificate", "markEnrollmentFinished"]);
  });
});
