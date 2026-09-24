import { NextResponse } from "next/server";
import { buildOpenApiDocument, registerV1Route, registeredV1Paths } from "@/lib/api/v1/registry";
import { v1Public } from "@/lib/api/v1/with-v1";

// Importing route modules runs their registerV1Route() calls, so the
// generated document always covers every v1 endpoint (CI test enforces it).
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
import "@/app/api/v1/docs/route";

registerV1Route({
  method: "get",
  path: "/api/v1/openapi.json",
  tags: ["app"],
  summary: "OpenAPI 3.1 hujjat (Zod kontraktlardan generatsiya)",
  responses: { 200: { description: "OpenAPI JSON" } },
});

export async function GET(request: Request) {
  return v1Public(request, async () => {
    const document = buildOpenApiDocument();
    return NextResponse.json(
      { ...document, "x-registered-routes": registeredV1Paths().length },
      { headers: { "Cache-Control": "public, max-age=300", "X-Route-Count": String(registeredV1Paths().length) } },
    );
  });
}
