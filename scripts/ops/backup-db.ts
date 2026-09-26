/**
 * Encrypted logical backup, built on the same snapshot + manifest code as move-db.
 *
 *   npm run backup:db -- --out ./backup [--from SOURCE_DATABASE_URL]
 *
 * Writes <out>/naqsh-<UTC stamp>.dump.age and <out>/naqsh-<stamp>.manifest.json.age, encrypted to
 * every public key in BACKUP_AGE_RECIPIENTS. Plain files exist only in a 0700 temp dir and are
 * deleted on exit. Used nightly by .github/workflows/db-backup.yml.
 */
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parseFlags, UsageError } from "./lib/args";
import { dumpWithManifest, type Ctx } from "./lib/copy";
import { findPgTools, hasAge } from "./lib/pgtools";
import { inspectSource } from "./lib/preflight";
import { encryptInto, exitWithError, loadDotEnv, log, resolveConn, secretsFor } from "./lib/runtime";
import { Scratch, parseAgeRecipients } from "./lib/tempdir";
import { totalRows } from "./lib/verify-sql";

let secrets: string[] = [];

export function backupStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
}

async function main(): Promise<void> {
  loadDotEnv();
  const f = parseFlags(process.argv.slice(2), { from: "env", out: "path" } as const);
  if (!f.out) throw new UsageError("--out <dir> is required");
  if (!parseAgeRecipients(process.env.BACKUP_AGE_RECIPIENTS).length) {
    throw new UsageError("BACKUP_AGE_RECIPIENTS is empty: backups are only ever written encrypted");
  }
  if (!hasAge()) throw new UsageError("`age` is not installed (https://age-encryption.org) / age o'rnatilmagan");
  const fromName = f.from ?? (process.env.SOURCE_DATABASE_URL ? "SOURCE_DATABASE_URL" : "DATABASE_URL");
  log("Naqsh backup-db / zaxira nusxa");
  const source = resolveConn(fromName, "SOURCE", { session: true });
  secrets = secretsFor(source);
  const tools = findPgTools();

  const info = await inspectSource(source.info);
  if (info.missingTables.length) throw new Error(`source is missing ${info.missingTables.join(", ")}`);

  const scratch = new Scratch();
  try {
    const ctx: Ctx = { tools, scratch, passfile: scratch.pgpass("pgpass", [source.info]), secrets, log };
    const stamp = backupStamp(new Date());
    const dumpFile = scratch.file(`naqsh-${stamp}.dump`);
    const manifest = await dumpWithManifest(source.info, ctx, dumpFile);
    const manifestFile = scratch.writePrivate(`naqsh-${stamp}.manifest.json`, JSON.stringify(manifest, null, 1));
    const outputs = encryptInto(path.resolve(f.out), [dumpFile, manifestFile]);
    for (const file of outputs) {
      const sha = createHash("sha256").update(readFileSync(file)).digest("hex");
      log(`  ${path.basename(file)}  ${(statSync(file).size / 1e6).toFixed(2)} MB  sha256 ${sha}`);
    }
    log(`✔ backup OK: ${manifest.tables.length} tables, ${totalRows(manifest)} rows (encrypted, plain copy deleted)`);
  } finally {
    await scratch.close();
  }
}

if (process.argv[1] && /backup-db\.ts$/.test(process.argv[1])) {
  main().catch((e) => exitWithError(e, secrets));
}
