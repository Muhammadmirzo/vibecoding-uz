import type { Sql } from "postgres";

/**
 * Lockdown invariant (migration 0014): the Supabase Data API roles (anon, authenticated) have
 * NO privileges in schema public, and every public table has RLS enabled (no policies = deny).
 * The app connects as postgres, which bypasses RLS. Read-only: safe against production.
 */
export interface LockdownReport {
  tableGrants: number;
  routineGrants: number;
  usageGrants: number;
  tablesWithoutRls: string[];
}

export async function checkLockdown(sql: Sql): Promise<LockdownReport> {
  const [tables] = await sql<{ n: number }[]>`
    SELECT count(*)::int AS n FROM information_schema.role_table_grants
    WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')`;
  const [routines] = await sql<{ n: number }[]>`
    SELECT count(*)::int AS n FROM information_schema.routine_privileges
    WHERE routine_schema = 'public' AND grantee IN ('anon', 'authenticated')`;
  const [usage] = await sql<{ n: number }[]>`
    SELECT count(*)::int AS n FROM information_schema.usage_privileges
    WHERE object_schema = 'public' AND grantee IN ('anon', 'authenticated')`;
  const noRls = await sql<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity ORDER BY tablename`;
  return {
    tableGrants: tables?.n ?? 0,
    routineGrants: routines?.n ?? 0,
    usageGrants: usage?.n ?? 0,
    tablesWithoutRls: noRls.map((row) => row.tablename),
  };
}

export function lockdownProblems(report: LockdownReport): string[] {
  const problems: string[] = [];
  if (report.tableGrants > 0) problems.push(`${report.tableGrants} table grant(s) to anon/authenticated`);
  if (report.routineGrants > 0) problems.push(`${report.routineGrants} function grant(s) to anon/authenticated`);
  if (report.usageGrants > 0) problems.push(`${report.usageGrants} sequence/usage grant(s) to anon/authenticated`);
  if (report.tablesWithoutRls.length > 0) problems.push(`RLS disabled on: ${report.tablesWithoutRls.join(", ")}`);
  return problems;
}
