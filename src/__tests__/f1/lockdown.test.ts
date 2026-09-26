import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import postgres from "postgres";
import { checkLockdown, lockdownProblems } from "@/db/lockdown";

const migration = readFileSync(path.resolve(__dirname, "../../../drizzle/0014_lockdown_public.sql"), "utf8");

describe("F1: migration 0014 lockdown_public", () => {
  it("revokes anon/authenticated on tables, sequences, functions and default privileges (guarded by role existence)", () => {
    expect(migration).toMatch(/IF EXISTS \(SELECT 1 FROM pg_roles WHERE rolname = 'anon'\)/);
    for (const kind of ["TABLES", "SEQUENCES", "FUNCTIONS"]) {
      expect(migration).toContain(`REVOKE ALL ON ALL ${kind} IN SCHEMA public FROM anon, authenticated;`);
      expect(migration).toContain(`ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ${kind} FROM anon, authenticated;`);
    }
  });

  it("enables RLS by looping pg_tables, so a re-run covers new tables", () => {
    expect(migration).toMatch(/FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity/);
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
  });

  it("deletes the legacy secret rows from site_settings", () => {
    expect(migration).toContain("DELETE FROM \"site_settings\" WHERE \"key\" IN ('paymeSecretKey', 'clickSecretKey', 'telegramBotToken', 'smsApiKey')");
  });

  it("is idempotent (IF NOT EXISTS on every CREATE)", () => {
    const creates = migration.match(/^CREATE (UNIQUE )?(TABLE|INDEX)[^;]*/gm) ?? [];
    expect(creates.length).toBeGreaterThan(0);
    for (const statement of creates) expect(statement).toContain("IF NOT EXISTS");
  });

  it("lockdownProblems lists every violation and nothing when clean", () => {
    expect(lockdownProblems({ tableGrants: 0, routineGrants: 0, usageGrants: 0, tablesWithoutRls: [] })).toEqual([]);
    const problems = lockdownProblems({ tableGrants: 2, routineGrants: 1, usageGrants: 1, tablesWithoutRls: ["new_table"] });
    expect(problems).toHaveLength(4);
    expect(problems.join(" ")).toContain("new_table");
  });
});

// Live guard (read-only). Skipped without DATABASE_URL (CI) or against a local dev database.
const liveUrl = process.env.DATABASE_URL ?? "";
const runLive = liveUrl !== "" && !/@(localhost|127\.0\.0\.1)[:/]/.test(liveUrl);

describe.skipIf(!runLive)("F1: live DB lockdown guard", () => {
  it("has 0 grants to anon/authenticated in public and RLS on every public table", async () => {
    const sql = postgres(liveUrl, { prepare: false, max: 1, connect_timeout: 15 });
    try {
      expect(lockdownProblems(await checkLockdown(sql))).toEqual([]);
    } finally {
      await sql.end({ timeout: 1 });
    }
  }, 30_000);
});
