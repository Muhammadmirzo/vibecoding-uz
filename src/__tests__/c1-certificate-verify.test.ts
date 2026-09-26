// C1: the public certificate page must render REAL data only.
// L14 — never render a "Verified" badge for a code that is not in the database.
// L13 — a well-formed but unknown code must 404, not soft-404.
import { describe, expect, it, vi, beforeEach } from "vitest";

// L37: the REAL `next/navigation` is used on purpose. A mock that throws a
// custom error hides the defect this file guards: in Next 15.5 `notFound()`
// throws an error whose digest is "NEXT_HTTP_ERROR_FALLBACK;404", not the
// legacy "NEXT_NOT_FOUND". The page used to re-throw only the legacy digest
// from inside its try/catch, so a well-formed but unknown code was swallowed
// and rendered "Hozir tekshirib bo'lmadi" (a 200) instead of a 404.
const verifyCertificate = vi.fn<(input: { code: string }) => Promise<unknown>>();
const loadCertificateOwner = vi.fn<(cert: unknown) => Promise<unknown>>();

vi.mock("@/lib/certificates/service", () => ({
  verifyCertificate: (input: { code: string }) => verifyCertificate(input),
  loadCertificateOwner: (cert: unknown) => loadCertificateOwner(cert),
}));

import { notFound as realNotFound } from "next/navigation";
import CertificateVerificationPage, { generateMetadata } from "@/app/shahodatnoma/[code]/page";

// vitest transpiles .tsx with the classic JSX runtime, so rendering needs React in scope.
const { createElement, Fragment } = await import("react");
(globalThis as { React?: unknown }).React = { createElement, Fragment };

const CODE = "NAQSH-2026-ABCDE";
const CERTIFICATE = { id: "c1", enrollmentId: "e1", code: CODE, holderName: "Stored Holder", courseTitle: "Stored Course", finalScore: "8.50" };

function render(code: string) {
  return CertificateVerificationPage({ params: Promise.resolve({ code }) });
}

const NOT_FOUND_DIGEST = "NEXT_HTTP_ERROR_FALLBACK;404";

async function expectNotFound(run: () => Promise<unknown>) {
  await expect(run()).rejects.toSatisfy(
    (error: unknown) =>
      typeof error === "object" &&
      error !== null &&
      String((error as { digest?: unknown }).digest).startsWith("NEXT_HTTP_ERROR_FALLBACK;404"),
  );
}

/**
 * Collects the literal text rendered by the returned element tree. Walks only
 * `children`/`className` (never component references, which are circular).
 */
function textOf(node: unknown, out: string[] = []): string {
  if (node === null || node === undefined || typeof node === "boolean") return out.join(" ");
  if (typeof node === "string" || typeof node === "number") {
    out.push(String(node));
    return out.join(" ");
  }
  if (Array.isArray(node)) {
    node.forEach((child) => textOf(child, out));
    return out.join(" ");
  }
  const props = (node as { props?: Record<string, unknown> }).props;
  if (props) {
    textOf(props.children, out);
    if (typeof props.className === "string") out.push(props.className);
  }
  return out.join(" ");
}

beforeEach(() => {
  verifyCertificate.mockReset();
  loadCertificateOwner.mockReset();
});

describe("C1 certificate verification page", () => {
  it("renders the DEMO2026 code without touching the database", async () => {
    const node = await render("DEMO2026");
    const text = textOf(node);
    expect(node).toBeTruthy();
    expect(verifyCertificate).not.toHaveBeenCalled();
    expect(text).toContain("DEMO2026");
    // L14: a demo must look like a demo, never like a verified certificate.
    expect(text).not.toContain("Haqiqiy Sertifikat (Verified)");
    expect(text).toContain("Demo");
  });

  it.each(["", "bad%20code", "abc!def", "NAQSH-2026-", "..%2F..%2Fadmin"])(
    "404s on an invalid code format (%s) without a db lookup",
    async (code) => {
      await expectNotFound(() => render(code));
      expect(verifyCertificate).not.toHaveBeenCalled();
    },
  );

  it("404s when a well-formed code does not exist in the database", async () => {
    verifyCertificate.mockResolvedValue(null);
    await expectNotFound(() => render(CODE));
    expect(verifyCertificate).toHaveBeenCalledWith({ code: CODE });
    expect(loadCertificateOwner).not.toHaveBeenCalled();
  });

  // L37 regression: the page's try/catch must not swallow the REAL notFound().
  it("propagates the real Next 15 notFound digest for an unknown code (never a 200)", async () => {
    verifyCertificate.mockResolvedValue(null);
    let caught: unknown;
    try {
      await render(CODE);
    } catch (error: unknown) {
      caught = error;
    }
    // Ground truth: the digest the installed Next actually throws.
    let realDigest = "";
    try {
      realNotFound();
    } catch (error: unknown) {
      realDigest = String((error as { digest?: unknown }).digest ?? "");
    }
    expect(realDigest).toBe(NOT_FOUND_DIGEST);
    expect(String((caught as { digest?: unknown })?.digest ?? "")).toBe(realDigest);
  });

  // L37: a genuine DB failure must still be the honest "cannot check" state.
  it("keeps the unavailable state (no 404) when the DB throws", async () => {
    verifyCertificate.mockRejectedValue(new Error("connection terminated unexpectedly"));
    const text = textOf(await render(CODE));
    expect(text).toContain("Hozir tekshirib bo");
    expect(text).not.toContain("Haqiqiy Sertifikat (Verified)");
  });

  it("renders real certificate data for an existing code", async () => {
    verifyCertificate.mockResolvedValue(CERTIFICATE);
    loadCertificateOwner.mockResolvedValue({
      holderName: "Nilufar Karimova",
      courseTitle: "Vibe Coding Express",
      score: 8.5,
      issuedAt: new Date("2026-09-07T00:00:00Z"),
    });

    const text = textOf(await render(CODE));
    expect(text).toContain("Haqiqiy Sertifikat (Verified)");
    expect(text).toContain("Nilufar Karimova");
    expect(text).toContain("Vibe Coding Express");
    expect(text).toContain("8.5 / 10");
    expect(text).not.toContain("Jamshid Alimov");
  });

  // A1 defect 2: a DB failure must be an honest "cannot check right now" state —
  // never a 404 (the code may exist), never a 500, never a verified badge.
  it("renders an honest unavailable state (no verified badge, no 404) when the DB throws", async () => {
    verifyCertificate.mockRejectedValue(new Error("connection terminated unexpectedly"));
    const text = textOf(await render(CODE));
    expect(text).toContain("Hozir tekshirib bo");
    expect(text).toContain("birozdan so");
    expect(text).not.toContain("Haqiqiy Sertifikat (Verified)");
    expect(text).not.toContain("Demo talaba");
  });

  it("renders the unavailable state when loadCertificateOwner throws", async () => {
    verifyCertificate.mockResolvedValue(CERTIFICATE);
    loadCertificateOwner.mockRejectedValue(new Error("relation \"enrollments\" does not exist"));
    const text = textOf(await render(CODE));
    expect(text).toContain("Hozir tekshirib bo");
    expect(text).not.toContain("Haqiqiy Sertifikat (Verified)");
  });

  it("keeps force-dynamic so a stale verified badge is never cached", async () => {
    const mod = await import("@/app/shahodatnoma/[code]/page");
    expect(mod.dynamic).toBe("force-dynamic");
  });

  it("noindexes the demo code and invalid formats, but keeps a real code indexable", async () => {
    const demo = await generateMetadata({ params: Promise.resolve({ code: "DEMO2026" }) });
    const invalid = await generateMetadata({ params: Promise.resolve({ code: "not a code!" }) });
    const real = await generateMetadata({ params: Promise.resolve({ code: CODE }) });
    expect(demo.robots).toEqual({ index: false, follow: false });
    expect(invalid.robots).toEqual({ index: false, follow: false });
    expect(real.robots).toBeUndefined();
  });
});
