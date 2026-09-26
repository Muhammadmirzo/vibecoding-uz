/**
 * Move the whole app database to another Postgres, verified, in one command.
 *
 *   npm run move:db -- --to NEW_DATABASE_URL --dry-run     # read-only preflight, nothing written
 *   npm run move:db -- --to NEW_DATABASE_URL               # real move (asks for KOCHIR)
 *   npm run move:db -- --unfreeze                          # rollback: old DB read-write again
 *
 * Source: --from <ENV> or SOURCE_DATABASE_URL or DATABASE_URL. URLs are only ever read from env.
 * Design + safety notes: docs/ops/PORTABILITY.md §3.
 */
import { parseMoveArgs } from "./lib/args";
import { dumpWithManifest, ensureExtensions, restoreInto, verifyTarget, type Ctx } from "./lib/copy";
import { freezeSource, unfreezeSource } from "./lib/freeze";
import { findPgTools, type PgTools } from "./lib/pgtools";
import { preflight } from "./lib/preflight";
import {
  confirmOrExit, encryptInto, exitWithError, loadDotEnv, log, resolveConn, secretsFor, type ResolvedConn,
} from "./lib/runtime";
import { Scratch } from "./lib/tempdir";
import { totalRows } from "./lib/verify-sql";

let secrets: string[] = [];

function sourceEnvName(from: string | undefined): string {
  if (from) return from;
  return process.env.SOURCE_DATABASE_URL ? "SOURCE_DATABASE_URL" : "DATABASE_URL";
}

async function main(): Promise<void> {
  loadDotEnv();
  const args = parseMoveArgs(process.argv.slice(2));
  log("Naqsh move-db / bazani ko'chirish");
  const source = resolveConn(sourceEnvName(args.from), "SOURCE", { session: true });
  secrets = secretsFor(source);

  if (args.unfreeze) {
    await confirmOrExit(args.yes, "This makes the SOURCE database writable again (rollback).");
    await unfreezeSource(source.info, log);
    return;
  }

  const target = resolveConn(args.to!, "TARGET", { session: true });
  secrets = secretsFor(source, target);

  let tools: PgTools | null = null;
  try {
    tools = findPgTools();
    log(`  tools: pg_dump/pg_restore ${tools.major}`);
  } catch (e) {
    if (!args.dryRun) throw e;
    log(`  ! ${(e as Error).message.split("\n")[0]} (dry run continues)`);
  }

  log("\n1) Preflight (read-only) / tekshiruv");
  const pf = await preflight(source.info, target.info);
  for (const n of pf.notes) log(`  - ${n}`);
  if (pf.problems.length) {
    for (const p of pf.problems) log(`  ✖ ${p}`);
    throw new Error(`preflight found ${pf.problems.length} problem(s); nothing was changed / hech narsa o'zgarmadi`);
  }
  log("  ✔ preflight OK");

  printPlan(args.freeze, target);
  if (args.dryRun) {
    log("\nDRY RUN: nothing was written anywhere. / Sinov: hech narsa yozilmadi.");
    return;
  }
  if (args.keepDump && !process.env.BACKUP_AGE_RECIPIENTS) {
    throw new Error("--keep-dump needs BACKUP_AGE_RECIPIENTS (age public keys); plain dumps are never kept");
  }
  await confirmOrExit(args.yes, "\nThis will freeze the live site for writes and copy all data.");
  await copy(args, source, target, tools!, pf.source.extensions);
}

async function copy(
  args: ReturnType<typeof parseMoveArgs>, source: ResolvedConn, target: ResolvedConn, tools: PgTools,
  extensions: { name: string; schema: string }[],
): Promise<void> {
  const scratch = new Scratch();
  let frozen = false;
  let success = false;
  scratch.onClose(async () => {
    if (frozen && !success) {
      log("\n↺ Failure after freeze → unfreezing the source so the site keeps working / manba qayta ochilmoqda");
      await unfreezeSource(source.info, log);
    }
  });
  try {
    const ctx: Ctx = { tools, scratch, passfile: scratch.pgpass("pgpass", [source.info, target.info]), secrets, log };
    if (args.freeze) {
      log("\n2) Maintenance / texnik rejim");
      frozen = true; // set BEFORE the call: a half-applied freeze must still be undone on failure
      await freezeSource(source.info, log);
    } else {
      log("\n2) --no-freeze: source stays writable (rehearsal only; later writes are NOT copied)");
    }
    log("\n3) Dump / nusxa olish");
    const dumpFile = scratch.file("naqsh.dump");
    const manifest = await dumpWithManifest(source.info, ctx, dumpFile);
    log("\n4) Restore / tiklash");
    await ensureExtensions(target.info, extensions);
    await restoreInto(target.info, ctx, dumpFile);
    log("\n5) Verify / tekshirish");
    const diffs = await verifyTarget(target.info, manifest, log);
    if (diffs.length) {
      for (const d of diffs.slice(0, 50)) log(`  ✖ ${d}`);
      throw new Error(
        `verification failed (${diffs.length} difference(s)). The TARGET is not trustworthy: drop and recreate it. ` +
          `The SOURCE was never modified. / Tekshiruv o'tmadi; eski baza tegilmagan.`,
      );
    }
    log(`  ✔ ${manifest.tables.length} tables, ${totalRows(manifest)} rows, ${manifest.sequences.length} sequences: identical (row counts + checksums)`);
    log("  ✔ drizzle.__drizzle_migrations identical; security baseline applied");
    if (args.keepDump) {
      const kept = encryptInto(args.keepDump, [dumpFile, scratch.writePrivate("manifest.json", JSON.stringify(manifest))]);
      log(`  kept encrypted copy: ${kept.join(", ")}`);
    }
    success = true;
    printNext(args.freeze, target);
  } finally {
    await scratch.close();
  }
}

function printPlan(freeze: boolean, target: ResolvedConn): void {
  log("\nPlan / reja:");
  log(`  ${freeze ? "2) freeze SOURCE (site: reads OK, writes → 503 maintenance)" : "2) no freeze (rehearsal)"}`);
  log("  3) pg_dump -Fc (public + drizzle) on a consistent snapshot, temp dir 0700, deleted at the end");
  log(`  4) pg_restore --single-transaction into ${target.envName}, then security baseline`);
  log("  5) verify every table: exact row count + md5 checksum, sequences, migration journal");
}

function printNext(frozen: boolean, target: ResolvedConn): void {
  log("\n✔ DONE / TAYYOR. Next step / keyingi qadam:");
  log(`  1. Point the app to the new DB: set DATABASE_URL on the host to the value of ${target.envName}`);
  log("     (Vercel: vercel env update DATABASE_URL production < file, then redeploy; see scripts/ops/switch-host.md)");
  log("  2. Smoke test: /api/health = 200, log in, one write (e.g. a lead form).");
  if (frozen) {
    log("  The OLD database stays READ-ONLY and untouched (your rollback).");
    log("  Rollback / orqaga qaytish: keep the old DATABASE_URL and run: npm run move -- db --unfreeze");
  }
}

if (process.argv[1] && /move-db\.ts$/.test(process.argv[1])) {
  main().catch((e) => exitWithError(e, secrets));
}
