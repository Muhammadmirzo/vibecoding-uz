/**
 * Checksum verification on top of the skillkit restore drill (scripts/restore-drill.mjs, which
 * restores a dump and counts rows but cannot verify a `--dump`-only restore).
 *
 *   npm run verify:restore -- --manifest /abs/naqsh-<stamp>.manifest.json --to DRILL_DATABASE_URL
 *
 * Compares the restored database with the manifest written by backup-db in the SAME snapshot as the
 * dump: exact row count + md5 checksum per table, sequences, RLS flags, migration journal, and no
 * grants to anon/authenticated. Exit 1 = the backup is not a faithful copy.
 */
import { readFileSync } from "node:fs";
import { parseFlags, UsageError } from "./lib/args";
import { verifyTarget } from "./lib/copy";
import { exitWithError, loadDotEnv, log, resolveConn, secretsFor } from "./lib/runtime";
import { parseManifest } from "./lib/verify";
import { totalRows } from "./lib/verify-sql";

let secrets: string[] = [];

async function main(): Promise<void> {
  loadDotEnv();
  const f = parseFlags(process.argv.slice(2), { manifest: "path", to: "env" } as const);
  if (!f.manifest || !f.to) throw new UsageError("--manifest <file> and --to <ENV_NAME> are required");
  log("Naqsh verify-restore / tiklangan bazani tekshirish");
  const target = resolveConn(f.to, "RESTORED", { session: false });
  secrets = secretsFor(target);
  const manifest = parseManifest(readFileSync(f.manifest, "utf8"));
  log(`  manifest: ${manifest.tables.length} tables, ${totalRows(manifest)} rows, taken ${manifest.createdAt}`);
  const diffs = await verifyTarget(target.info, manifest, log);
  if (diffs.length) {
    for (const d of diffs.slice(0, 50)) log(`  ✖ ${d}`);
    throw new Error(`RESTORE VERIFY FAILED: ${diffs.length} difference(s) — the backup is not a faithful copy`);
  }
  log(`✔ RESTORE VERIFIED: ${manifest.tables.length} tables, ${totalRows(manifest)} rows identical (counts + checksums)`);
}

if (process.argv[1] && /verify-restore\.ts$/.test(process.argv[1])) {
  main().catch((e) => exitWithError(e, secrets));
}
