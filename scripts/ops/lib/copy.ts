/**
 * The shared engine: snapshot dump + manifest, restore, security baseline, verification.
 * Used by move-db, backup-db and restore-drill so the backup path is the move path.
 */
import { libpqEnv, type ConnInfo } from "./conn";
import { dumpArgs, filterToc, restoreArgs, runTool, type PgTools } from "./pgtools";
import { connect } from "./preflight";
import { BASELINE_GRANTS_SQL, SECURITY_BASELINE_SQL } from "./ops-sql";
import type { Scratch } from "./tempdir";
import { collectManifest } from "./verify";
import { APP_SCHEMAS, compareManifests, quoteIdent, type Manifest } from "./verify-sql";

export interface Ctx {
  tools: PgTools;
  scratch: Scratch;
  passfile: string;
  secrets: string[];
  log: (line: string) => void;
}

/**
 * Exports a snapshot in a REPEATABLE READ READ ONLY transaction, computes the manifest in it and
 * runs pg_dump on the SAME snapshot, so manifest and dump describe exactly the same data.
 */
export async function dumpWithManifest(source: ConnInfo, ctx: Ctx, file: string): Promise<Manifest> {
  const sql = connect(source);
  try {
    return await sql.begin("isolation level repeatable read read only", async (tx) => {
      await tx.unsafe("SET LOCAL idle_in_transaction_session_timeout = 0");
      const [{ snapshot }] = await tx.unsafe<{ snapshot: string }[]>("SELECT pg_export_snapshot() AS snapshot");
      ctx.log("• Source checksums (snapshot) / manba nazorat summalari…");
      const manifest = await collectManifest(tx, ctx.log);
      ctx.log("• pg_dump (custom format, same snapshot)…");
      await runTool(ctx.tools.pgDump, dumpArgs(file, snapshot, APP_SCHEMAS), libpqEnv(source, ctx.passfile), ctx.secrets);
      return manifest;
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function ensureExtensions(target: ConnInfo, extensions: { name: string; schema: string }[]): Promise<void> {
  if (!extensions.length) return;
  const sql = connect(target);
  try {
    for (const e of extensions) {
      await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(e.schema)}`);
      await sql.unsafe(`CREATE EXTENSION IF NOT EXISTS ${quoteIdent(e.name)} SCHEMA ${quoteIdent(e.schema)}`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

/** All-or-nothing restore (--single-transaction), then our security baseline. */
export async function restoreInto(target: ConnInfo, ctx: Ctx, file: string): Promise<void> {
  const env = libpqEnv(target, ctx.passfile);
  const toc = await runTool(ctx.tools.pgRestore, ["--list", file], env, ctx.secrets);
  const listFile = ctx.scratch.writePrivate("restore.list", filterToc(toc));
  ctx.log("• pg_restore (single transaction) / tiklash…");
  await runTool(ctx.tools.pgRestore, restoreArgs(file, listFile, target.database), env, ctx.secrets);
  await applyBaseline(target, ctx.log);
}

export async function applyBaseline(target: ConnInfo, log: (line: string) => void): Promise<void> {
  const sql = connect(target);
  try {
    log("• Security baseline (REVOKE anon/authenticated, RLS on) / xavfsizlik bazasi…");
    await sql.unsafe(SECURITY_BASELINE_SQL);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

/** Target manifest must equal the source manifest, and no API role may hold a grant. */
export async function verifyTarget(target: ConnInfo, expected: Manifest, log: (line: string) => void): Promise<string[]> {
  const sql = connect(target);
  try {
    log("• Target checksums / manzil nazorat summalari…");
    const actual = await collectManifest(sql, log);
    const diffs = compareManifests(expected, actual);
    const grants = await sql.unsafe<{ issue: string }[]>(BASELINE_GRANTS_SQL);
    for (const g of grants) diffs.push(`grant still present: ${g.issue}`);
    return diffs;
  } finally {
    await sql.end({ timeout: 5 });
  }
}
