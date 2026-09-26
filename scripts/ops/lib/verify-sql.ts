/**
 * Pure SQL builders + manifest comparison for data verification.
 *
 * A manifest = per table: exact row count + md5 over the md5 of every row, in primary-key order
 * (whole-row order for tables without a PK, e.g. lesson_progress), plus sequence values and RLS flags.
 * Ordering and text output are pinned (COLLATE "C", ISO dates, UTC, extra_float_digits=3) so two
 * servers with different locales/time zones produce identical text for identical data.
 */

/** Schemas we own. Supabase platform schemas (auth, storage, realtime, vault…) are never copied. */
export const APP_SCHEMAS = ["public", "drizzle"] as const;

/** Must exist on both sides or the copy is not usable by the app. */
export const REQUIRED_TABLES = ["drizzle.__drizzle_migrations"] as const;

/** Run one by one before computing a manifest (postgres-js runs one statement per call). */
export const SESSION_SETUP: readonly string[] = [
  "SET datestyle = 'ISO, YMD'",
  "SET timezone = 'UTC'",
  "SET intervalstyle = 'postgres'",
  "SET extra_float_digits = 3",
  "SET bytea_output = 'hex'",
  "SET statement_timeout = 0",
];

export function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

export interface TableRef {
  schema: string;
  table: string;
  pk: string[];
  rls: boolean;
}

/** $1 = text[] of schemas. Returns schema, table, pk (ordered column names), rls. */
export const LIST_TABLES_SQL = `
SELECT n.nspname AS schema, c.relname AS "table", c.relrowsecurity AS rls,
  COALESCE((
    SELECT array_agg(a.attname::text ORDER BY k.ord)
    FROM pg_index i
    CROSS JOIN LATERAL unnest(i.indkey::int2[]) WITH ORDINALITY AS k(attnum, ord)
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
    WHERE i.indrelid = c.oid AND i.indisprimary
  ), ARRAY[]::text[]) AS pk
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r', 'p') AND n.nspname = ANY($1::text[])`;

/** $1 = text[] of schemas. */
export const LIST_SEQUENCES_SQL = `
SELECT schemaname AS schema, sequencename AS name, last_value::text AS value
FROM pg_sequences WHERE schemaname = ANY($1::text[])`;

/** Byte-order sort (not locale) so both sides list tables in the same order. */
export function sortTables<T extends { schema: string; table: string }>(tables: readonly T[]): T[] {
  const key = (t: T) => `${t.schema}\u0000${t.table}`;
  return [...tables].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
}

const ROW = "_naqsh_row";

/** SELECT n (exact count) and sum (md5 of per-row md5s in a deterministic order) for one table. */
export function checksumSql(t: Pick<TableRef, "schema" | "table" | "pk">): string {
  const order = t.pk.length > 0
    ? t.pk.map((c) => `${ROW}.${quoteIdent(c)}::text COLLATE "C"`).join(", ")
    : `${ROW}::text COLLATE "C"`;
  return (
    `SELECT count(*)::bigint::text AS n, ` +
    `md5(COALESCE(string_agg(md5(${ROW}::text), '' ORDER BY ${order}), '')) AS sum ` +
    `FROM ${quoteIdent(t.schema)}.${quoteIdent(t.table)} AS ${ROW}`
  );
}

export interface TableSum {
  name: string;
  rows: number;
  sum: string;
  rls: boolean;
}

export interface Manifest {
  version: 1;
  createdAt: string;
  serverMajor: number;
  tables: TableSum[];
  sequences: { name: string; value: string | null }[];
}

/** Human-readable differences; empty array = identical data. */
export function compareManifests(source: Manifest, target: Manifest): string[] {
  const diffs: string[] = [];
  const tgt = new Map(target.tables.map((t) => [t.name, t]));
  const src = new Map(source.tables.map((t) => [t.name, t]));
  for (const required of REQUIRED_TABLES) {
    if (!src.has(required)) diffs.push(`${required}: missing on source (migration journal)`);
    if (!tgt.has(required)) diffs.push(`${required}: missing on target (migration journal)`);
  }
  for (const s of source.tables) {
    const t = tgt.get(s.name);
    if (!t) { diffs.push(`${s.name}: missing on target`); continue; }
    if (t.rows !== s.rows) diffs.push(`${s.name}: rows ${s.rows} → ${t.rows}`);
    else if (t.sum !== s.sum) diffs.push(`${s.name}: same row count but data checksum differs`);
    if (s.name.startsWith("public.") && !t.rls) diffs.push(`${s.name}: RLS is off on target`);
  }
  for (const t of target.tables) if (!src.has(t.name)) diffs.push(`${t.name}: extra table on target`);
  const tseq = new Map(target.sequences.map((s) => [s.name, s.value]));
  for (const s of source.sequences) {
    if (!tseq.has(s.name)) diffs.push(`sequence ${s.name}: missing on target`);
    else if (tseq.get(s.name) !== s.value) diffs.push(`sequence ${s.name}: ${s.value} → ${tseq.get(s.name)}`);
  }
  return diffs;
}

export function totalRows(m: Manifest): number {
  return m.tables.reduce((sum, t) => sum + t.rows, 0);
}
