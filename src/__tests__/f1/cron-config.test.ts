import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isCronAuthorized } from "@/lib/security/cron";

const vercel = JSON.parse(readFileSync(path.resolve(__dirname, "../../../vercel.json"), "utf8")) as {
  regions: string[]; crons: { path: string; schedule: string }[];
};

describe("F1: Vercel crons", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("schedules reminders and analytics-retention once a day (Hobby plan limit), region stays syd1", () => {
    expect(vercel.regions).toEqual(["syd1"]);
    expect(vercel.crons.map((cron) => cron.path).sort()).toEqual(["/api/cron/analytics-retention", "/api/cron/reminders"]);
    for (const cron of vercel.crons) expect(cron.schedule).toMatch(/^\d{1,2} \d{1,2} \* \* \*$/);
  });

  it("cron routes accept Bearer CRON_SECRET (Vercel) and x-cron-secret (external schedulers), fail closed otherwise", () => {
    vi.stubEnv("CRON_SECRET", "cron-secret-value");
    const req = (headers: Record<string, string>) => new Request("https://app.test/api/cron/reminders", { headers });
    expect(isCronAuthorized(req({ authorization: "Bearer cron-secret-value" }))).toBe(true);
    expect(isCronAuthorized(req({ "x-cron-secret": "cron-secret-value" }))).toBe(true);
    expect(isCronAuthorized(req({ authorization: "Bearer wrong" }))).toBe(false);
    vi.stubEnv("CRON_SECRET", "");
    expect(isCronAuthorized(req({ authorization: "Bearer " }))).toBe(false);
  });
});
