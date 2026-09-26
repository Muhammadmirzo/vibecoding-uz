import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Vercel Crons and the portable cron sidecar (deploy/crontab.txt) must run the same jobs. */
const root = path.resolve(__dirname, "../../..");

function sidecarJobs(): Set<string> {
  return new Set(
    readFileSync(path.join(root, "deploy/crontab.txt"), "utf8")
      .split("\n")
      .filter((l) => l.trim() && !l.startsWith("#"))
      .map((l) => {
        const [mm, hh, p] = l.trim().split(/\s+/);
        return `${mm} ${hh} ${p}`;
      }),
  );
}

describe("cron portability", () => {
  it("every sidecar line is well-formed (MM HH /api/cron/...)", () => {
    for (const job of sidecarJobs()) expect(job).toMatch(/^(\d{2}|\*) (\d{2}|\*) \/api\/cron\/[\w-]+$/);
  });

  it("every daily Vercel cron has the same UTC time in the sidecar", () => {
    const file = path.join(root, "vercel.json");
    const crons: { path: string; schedule: string }[] = existsSync(file)
      ? (JSON.parse(readFileSync(file, "utf8")).crons ?? [])
      : [];
    const jobs = sidecarJobs();
    for (const c of crons) {
      const [m, h] = c.schedule.split(" ");
      const pad = (v: string) => (v === "*" ? "*" : v.padStart(2, "0"));
      expect(jobs, `${c.path} (${c.schedule}) missing in deploy/crontab.txt`).toContain(`${pad(m)} ${pad(h)} ${c.path}`);
    }
  });
});
