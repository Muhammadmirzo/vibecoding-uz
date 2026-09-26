/**
 * Computes a data manifest on a live connection (read-only). Call it inside the snapshot
 * transaction on the source, and on a plain connection on the target.
 */
import type { Sql, TransactionSql } from "postgres";
import {
  APP_SCHEMAS, LIST_SEQUENCES_SQL, LIST_TABLES_SQL, SESSION_SETUP, checksumSql, sortTables,
  type Manifest, type TableRef,
} from "./verify-sql";

type Runner = Sql | TransactionSql;

export async function collectManifest(sql: Runner, log: (line: string) => void = () => {}): Promise<Manifest> {
  for (const statement of SESSION_SETUP) await sql.unsafe(statement);
  const schemas = [...APP_SCHEMAS];
  const [{ v }] = await sql.unsafe<{ v: string }[]>("SELECT current_setting('server_version_num') AS v");
  const rawTables = await sql.unsafe<TableRef[]>(LIST_TABLES_SQL, [schemas]);
  const tables = sortTables(rawTables);
  const sums: Manifest["tables"] = [];
  for (const t of tables) {
    const [row] = await sql.unsafe<{ n: string; sum: string }[]>(checksumSql(t));
    sums.push({ name: `${t.schema}.${t.table}`, rows: Number(row.n), sum: row.sum, rls: t.rls });
  }
  const seqRows = await sql.unsafe<{ schema: string; name: string; value: string | null }[]>(LIST_SEQUENCES_SQL, [schemas]);
  const sequences = seqRows
    .map((s) => ({ name: `${s.schema}.${s.name}`, value: s.value }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  log(`  ${sums.length} tables, ${sums.reduce((n, t) => n + t.rows, 0)} rows, ${sequences.length} sequences`);
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    serverMajor: Math.floor(Number(v) / 10000),
    tables: sums,
    sequences,
  };
}

export function parseManifest(json: string): Manifest {
  const m = JSON.parse(json) as Partial<Manifest>;
  if (m.version !== 1 || !Array.isArray(m.tables) || !Array.isArray(m.sequences)) {
    throw new Error("manifest file is not a version-1 Naqsh manifest");
  }
  return m as Manifest;
}
