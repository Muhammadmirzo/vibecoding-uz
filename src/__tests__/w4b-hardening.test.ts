import { afterEach, describe, expect, it, vi } from "vitest";
import { contentSecurityPolicy } from "@/lib/security/headers";
import { errorResponse, isDatabaseUnavailable } from "@/lib/http/errors";
import { getSettings } from "@/features/crm/server/admin.service";
import type { AdminRepository } from "@/features/crm/server/admin.repository";
import { canonicalUrl, serializeJsonLd } from "@/lib/seo";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("W4B hardening", () => {
  it("uses nonce CSP and does not permit inline or eval scripts", () => {
    const csp = contentSecurityPolicy("test-nonce");
    expect(csp).toContain("'nonce-test-nonce'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe/);
    expect(csp).not.toContain("https://telegram.org\"");
    expect(csp).toContain("frame-src https://oauth.telegram.org");
  });

  it("maps database outages to a retryable Uzbek 503 envelope", async () => {
    const error = Object.assign(new Error("Connection terminated unexpectedly"), { code: "ECONNRESET" });
    expect(isDatabaseUnavailable(error)).toBe(true);
    const response = errorResponse(error);
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: "database_unavailable", retryable: true });
  });

  it("redacts legacy provider secrets and exposes status only", async () => {
    vi.stubEnv("PAYME_KEY", "configured");
    vi.stubEnv("PAYME_MERCHANT_ID", "merchant");
    const repository: AdminRepository = {
      listAuditLogs: async () => [],
      getAllSettings: async () => [{ key: "paymeSecretKey", value: "must-not-leak" }, { key: "siteTitle", value: "Naqsh" }],
      upsertSettingTx: async () => undefined,
      recordAuditTx: async () => undefined,
    };
    const settings = await getSettings(repository);
    expect(settings).not.toHaveProperty("paymeSecretKey");
    expect(settings.integrationStatus).toEqual(expect.objectContaining({ payme: "sozlangan" }));
  });

  it("keeps canonical URLs and JSON-LD serialization deterministic", () => {
    expect(canonicalUrl("/kurs/vibe-coding-express")).toContain("/kurs/vibe-coding-express");
    expect(serializeJsonLd({ name: "a<b" })).toContain("\\u003c");
  });
});
