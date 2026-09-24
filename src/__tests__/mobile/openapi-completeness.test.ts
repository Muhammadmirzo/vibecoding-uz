import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Importing every v1 route module runs its registerV1Route() call.
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
import "@/app/api/v1/openapi.json/route";
import "@/app/api/v1/docs/route";
import { registeredV1Paths } from "@/lib/api/v1/registry";

const V1_ROOT = join(process.cwd(), "src/app/api/v1");

function routeFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) routeFiles(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

/** Maps src/app/api/v1/.../route.ts to its OpenAPI path (Next [x] → {x}). */
function expectedPath(file: string): string {
  const rel = file.slice(V1_ROOT.length).replace(/\/route\.ts$/, "") || "/";
  const openapi = rel.replace(/\[(.*?)\]/g, "{$1}");
  return `/api/v1${openapi}`;
}

describe("OpenAPI completeness: every v1 route has a registered contract", () => {
  it("covers all route files", () => {
    const files = routeFiles(V1_ROOT);
    expect(files.length).toBeGreaterThan(15);
    const registered = new Set(registeredV1Paths().map((entry) => entry.split(" ")[1]));
    const missing: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const handlers = ["GET", "POST", "PATCH", "PUT", "DELETE"].filter((method) =>
        new RegExp(`export\\s+async\\s+function\\s+${method}\\b`).test(source),
      );
      for (const method of handlers) {
        if (!registered.has(`${expectedPath(file)}`) || !registeredV1Paths().includes(`${method} ${expectedPath(file)}`)) {
          missing.push(`${method} ${expectedPath(file)} (${file})`);
        }
      }
      // Each route module must self-register its contract.
      if (!/registerV1Route/.test(source)) missing.push(`NO registerV1Route in ${file}`);
    }
    expect(missing).toEqual([]);
  });
});
