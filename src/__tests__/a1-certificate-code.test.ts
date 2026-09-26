// A1 defect 3: the public certificate code is a trust artefact, so it must come from a CSPRNG
// (`node:crypto` randomInt), never `Math.random`, and its random part is 8 characters.
import { describe, expect, it } from "vitest";
import { CODE_RANDOM_LENGTH, generateUniqueCertificateCode, prepareCertificateTemplate } from "@/lib/certificates/template";

const FORMAT = /^NAQSH-\d{4}-[A-HJ-NP-Z2-9]{8}$/;

describe("A1: certificate code generation", () => {
  it("matches NAQSH-<year>-XXXXXXXX with an 8-char random part", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateUniqueCertificateCode();
      expect(code).toMatch(FORMAT);
      expect(code.split("-")[2]).toHaveLength(CODE_RANDOM_LENGTH);
      expect(CODE_RANDOM_LENGTH).toBe(8);
    }
  });

  it("produces different codes (no constant seed / no Math.random stub left behind)", () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateUniqueCertificateCode()));
    // 32^8 combinations — 200 draws colliding is impossible.
    expect(codes.size).toBe(200);
  });

  it("keeps every generated code verifiable by the public page regex", () => {
    // Same shape the /shahodatnoma/[code] page accepts (alphanumeric parts joined by dashes),
    // so older 5-char codes and the new 8-char codes both pass.
    const PAGE_REGEX = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
    expect(generateUniqueCertificateCode()).toMatch(PAGE_REGEX);
    // Legacy codes already in the database must still verify.
    expect("NAQSH-2026-7A9K2").toMatch(PAGE_REGEX);
  });

  it("uses a CSPRNG: mocking Math.random cannot change the output", () => {
    const original = Math.random;
    Math.random = () => 0;
    try {
      const code = generateUniqueCertificateCode();
      expect(code).toMatch(FORMAT);
      expect(code.split("-")[2]).not.toBe("AAAAAAAA");
    } finally {
      Math.random = original;
    }
  });

  it("prepareCertificateTemplate still honours an explicitly supplied code", () => {
    const data = prepareCertificateTemplate({
      holderName: "Nilufar Karimova",
      courseTitle: "Vibe Coding Express",
      finalScore: 9,
      code: "NAQSH-2026-TEST1",
    });
    expect(data.certCode).toBe("NAQSH-2026-TEST1");
  });
});
