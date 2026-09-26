// A1 defect 1 (HIGH PII): the public certificate page must never render a phone number.
// /shahodatnoma/[code] is unauthenticated, so `users.phone` must not even be SELECTed —
// a phone fallback is a data leak even when the UI only prints it in an empty name field.
import { beforeEach, describe, expect, it, vi } from "vitest";

type JoinRow = Record<string, unknown> | undefined;
let joinRow: JoinRow = undefined;
const selectedAliases: string[] = [];

vi.mock("@/db", () => ({
  db: {
    select: (fields: Record<string, unknown>) => {
      selectedAliases.push(...Object.keys(fields));
      const chain = {
        from: () => chain,
        innerJoin: () => chain,
        leftJoin: () => chain,
        where: () => chain,
        limit: async () => (joinRow ? [joinRow] : []),
      };
      return chain;
    },
  },
}));

vi.mock("@/features/certificates/server/certificates.repository", () => ({ drizzleCertificatesRepository: {} }));
vi.mock("@/features/certificates/server/certificates.service", () => ({ getMyCertificate: vi.fn() }));

const { loadCertificateOwner } = await import("@/lib/certificates/service");

const CERTIFICATE = {
  id: "11111111-1111-4111-8111-111111111111",
  enrollmentId: "22222222-2222-4222-8222-222222222222",
  code: "NAQSH-2026-ABCDE",
  holderName: "Stored Holder",
  courseTitle: "Stored Course",
  finalScore: "8.50",
  issuedAt: new Date("2026-09-07T00:00:00Z"),
  pdfUrl: null,
};

type CertificateRow = Parameters<typeof loadCertificateOwner>[0];
const certificate = CERTIFICATE as unknown as CertificateRow;

beforeEach(() => {
  joinRow = undefined;
  selectedAliases.length = 0;
});

describe("A1: loadCertificateOwner leaks no phone number", () => {
  it("does not select users.phone at all", async () => {
    joinRow = { fullName: "Nilufar Karimova", courseTitle: "Vibe Coding Express", enrollmentScore: "8.50" };
    await loadCertificateOwner(certificate);
    expect(selectedAliases).toEqual(["fullName", "courseTitle", "enrollmentScore"]);
    expect(selectedAliases).not.toContain("phone");
  });

  it("returns no phone field at all", async () => {
    joinRow = { fullName: "Nilufar Karimova", courseTitle: "Vibe Coding Express", enrollmentScore: "8.50" };
    const owner = await loadCertificateOwner(certificate);
    expect(Object.keys(owner)).toEqual(["holderName", "courseTitle", "score", "issuedAt"]);
    expect(JSON.stringify(owner)).not.toContain("+998");
    expect(owner.holderName).toBe("Nilufar Karimova");
  });

  it("falls back to the issued holder name, never to a phone, when the join row is empty", async () => {
    const owner = await loadCertificateOwner(certificate);
    expect(owner.holderName).toBe("Stored Holder");
    expect(owner.courseTitle).toBe("Stored Course");
  });

  it("yields an empty holder name (page renders \"Ma'lumot yo'q\") when nothing is stored", async () => {
    const blank = { ...CERTIFICATE, holderName: "" } as unknown as CertificateRow;
    const owner = await loadCertificateOwner(blank);
    expect(owner.holderName).toBe("");
  });
});
