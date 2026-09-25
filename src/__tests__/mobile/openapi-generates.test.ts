import { describe, expect, it } from "vitest";

// Importing every v1 route module runs its registerV1Route() call, same as the
// completeness test — but here we also actually generate the OpenAPI document,
// which the completeness test does not do. A schema that zod-to-openapi can't
// convert (a bad union/record/refine) throws here, not there.
import "@/app/api/v1/auth/token/route";
import "@/app/api/v1/auth/telegram/start/route";
import "@/app/api/v1/auth/telegram/status/route";
import "@/app/api/v1/auth/refresh/route";
import "@/app/api/v1/auth/logout/route";
import "@/app/api/v1/auth/sessions/route";
import "@/app/api/v1/auth/sessions/[id]/route";
import "@/app/api/v1/me/route";
import "@/app/api/v1/me/enrollments/route";
import "@/app/api/v1/me/payments/route";
import "@/app/api/v1/me/certificates/route";
import "@/app/api/v1/me/referral/route";
import "@/app/api/v1/courses/route";
import "@/app/api/v1/courses/[slug]/route";
import "@/app/api/v1/courses/[slug]/lessons/route";
import "@/app/api/v1/lessons/[id]/route";
import "@/app/api/v1/lessons/[id]/progress/route";
import "@/app/api/v1/homework/route";
import "@/app/api/v1/push-devices/route";
import "@/app/api/v1/push-devices/[id]/route";
import "@/app/api/v1/app/config/route";
import "@/app/api/v1/events/route";
import "@/app/api/v1/admin/analytics/[report]/route";
import "@/app/api/v1/chat/route";
import "@/app/api/v1/chat/read/route";
import "@/app/api/v1/chat/messages/route";
import "@/app/api/v1/chat/open/route";
import "@/app/api/v1/admin/chat/read/route";
import "@/app/api/v1/admin/chat/messages/route";
import "@/app/api/v1/admin/chat/conversations/route";
import "@/app/api/v1/admin/chat/drafts/route";
import "@/app/api/v1/docs/route";
import { buildOpenApiDocument } from "@/lib/api/v1/registry";

describe("OpenAPI document generation", () => {
  it("builds without throwing and every path has a response schema", () => {
    const doc = buildOpenApiDocument();
    expect(doc.paths).toBeTruthy();
    const missingSchema: string[] = [];
    for (const [path, methods] of Object.entries(doc.paths ?? {})) {
      if (path === "/api/v1/docs") continue; // Scalar HTML page, not JSON.
      for (const [method, op] of Object.entries(methods as Record<string, unknown>)) {
        if (typeof op !== "object" || op === null || !("responses" in op)) continue;
        const responses = (op as { responses: Record<string, unknown> }).responses;
        for (const [status, response] of Object.entries(responses)) {
          if (status === "401" || status === "403" || status === "429" || status === "503") continue;
          const content = (response as { content?: Record<string, unknown> }).content;
          if (!content) missingSchema.push(`${method.toUpperCase()} ${path} -> ${status}`);
        }
      }
    }
    expect(missingSchema).toEqual([]);
  });
});
