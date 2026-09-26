/**
 * Read-only guard for the 0014 lockdown: 0 grants to anon/authenticated in schema public and
 * RLS enabled on every public table. Usage: npm run db:lockdown-check (reads DATABASE_URL from .env).
 * Run it after every migration; a new table without ENABLE ROW LEVEL SECURITY fails here.
 */
import postgres from "postgres";
import { checkLockdown, lockdownProblems } from "../src/db/lockdown";

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 15 });
  try {
    const problems = lockdownProblems(await checkLockdown(sql));
    if (problems.length > 0) {
      console.error(`LOCKDOWN FAIL:\n- ${problems.join("\n- ")}`);
      process.exitCode = 1;
      return;
    }
    console.log("LOCKDOWN OK: 0 anon/authenticated grants in public, RLS on every public table");
  } finally {
    await sql.end({ timeout: 1 });
  }
}

main().catch((error: unknown) => {
  console.error("LOCKDOWN CHECK ERROR:", error instanceof Error ? error.name : "unknown");
  process.exitCode = 1;
});
