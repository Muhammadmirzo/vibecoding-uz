/**
 * The owner's single entry point.
 *
 *   npm run move -- db --to NEW_DATABASE_URL --dry-run      # rehearse: read-only checks
 *   npm run move -- db --to NEW_DATABASE_URL                # move + verify (asks for KOCHIR)
 *   npm run move -- db --to NEW_DATABASE_URL --switch-vercel [--app-url-env NEW_APP_DATABASE_URL]
 *                                                           # …then also set DATABASE_URL on Vercel
 *   npm run move -- db --unfreeze                           # rollback: old DB writable again
 *
 * `--switch-vercel` runs only after a fully verified copy, asks again, and pipes the new URL to
 * `vercel env update DATABASE_URL production` through stdin (never argv/history), then runs
 * `vercel deploy --prod --yes` from a clean main. Manual path: scripts/ops/switch-host.md.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { UsageError, envName } from "./lib/args";
import { confirmOrExit, exitWithError, loadDotEnv, log } from "./lib/runtime";
import { secretsOf } from "./lib/mask";

export interface WrapperArgs {
  sub: "db" | "help";
  passThrough: string[];
  switchVercel: boolean;
  appUrlEnv?: string;
  to?: string;
  dryRun: boolean;
  yes: boolean;
}

/** Splits wrapper-only flags from the flags forwarded to move-db. */
export function parseWrapperArgs(argv: readonly string[]): WrapperArgs {
  const [sub, ...rest] = argv;
  if (!sub || sub === "help" || sub === "--help") {
    return { sub: "help", passThrough: [], switchVercel: false, dryRun: false, yes: false };
  }
  if (sub !== "db") throw new UsageError(`unknown target "${sub}". Only "db" moves data; the app moves with Docker (docs/ops/PORTABILITY.md).`);
  const passThrough: string[] = [];
  let switchVercel = false;
  let appUrlEnv: string | undefined;
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--switch-vercel") switchVercel = true;
    else if (a === "--app-url-env") appUrlEnv = envName("--app-url-env", rest[++i]);
    else passThrough.push(a);
  }
  const toIdx = passThrough.indexOf("--to");
  const to = toIdx >= 0 ? passThrough[toIdx + 1] : undefined;
  const dryRun = passThrough.includes("--dry-run");
  const yes = passThrough.includes("--yes");
  if (switchVercel && (!to || dryRun || passThrough.includes("--no-freeze") || passThrough.includes("--unfreeze"))) {
    throw new UsageError("--switch-vercel only goes with a real move: db --to <ENV> (no --dry-run/--no-freeze)");
  }
  return { sub: "db", passThrough, switchVercel, appUrlEnv, to, dryRun, yes };
}

function help(): void {
  log(`Naqsh portability / ko'chirish
  npm run move -- db --to NEW_DATABASE_URL --dry-run    read-only preflight
  npm run move -- db --to NEW_DATABASE_URL              move + verify
  npm run move -- db --to NEW_DATABASE_URL --switch-vercel   …and set DATABASE_URL on Vercel
  npm run move -- db --unfreeze                         rollback (old DB writable again)
Put the new URL in .env or export it first; never type it after --to.
Without pg_dump 17 on this computer: gh workflow run move-db (see docs/ops/KOCHIRISH.md).`);
}

function runMoveDb(args: string[]): number {
  const tsx = path.resolve("node_modules/.bin/tsx");
  const r = spawnSync(tsx, [path.resolve("scripts/ops/move-db.ts"), ...args], { stdio: "inherit" });
  return r.status ?? 1;
}

async function switchVercel(appEnv: string, yes: boolean): Promise<void> {
  const value = process.env[appEnv];
  if (!value) throw new UsageError(`${appEnv} is not set; cannot switch Vercel`);
  log("\n6) Switch Vercel production DATABASE_URL / Vercelda DATABASE_URL almashtirish");
  await confirmOrExit(yes, `Vercel production DATABASE_URL will be replaced with the value of ${appEnv}.`);
  const r = spawnSync("vercel", ["env", "update", "DATABASE_URL", "production", "--yes"], {
    input: value, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
  });
  if (r.status !== 0) {
    const secrets = secretsOf(value);
    const err = secrets.reduce((t, s) => t.split(s).join("***"), `${r.stderr ?? ""}${r.error?.message ?? ""}`);
    throw new Error(`vercel env update failed (is the CLI logged in and linked to master-2?): ${err.trim()}`);
  }
  log("  ✔ Vercel DATABASE_URL (production) updated.");
  // Env changes only apply to new deployments: deploy current checkout with --prod.
  // We avoid `vercel redeploy <alias>` which can roll back production to older code (Hard rules).
  const rd = spawnSync("vercel", ["deploy", "--prod", "--yes"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (rd.status !== 0) {
    log(`  ! deploy failed; deploy from the Vercel dashboard or run 'vercel deploy --prod': ${(rd.stderr ?? "").trim().slice(-300)}`);
    return;
  }
  log(`  ✔ Deployed: ${rd.stdout.trim()} — now smoke test (switch-host.md step 5).`);
}

async function main(): Promise<void> {
  loadDotEnv();
  const args = parseWrapperArgs(process.argv.slice(2));
  if (args.sub === "help") return help();
  const code = runMoveDb(args.passThrough);
  if (code !== 0) process.exit(code);
  if (args.switchVercel) await switchVercel(args.appUrlEnv ?? args.to!, args.yes);
}

if (process.argv[1] && /move\.ts$/.test(process.argv[1])) {
  main().catch((e) => exitWithError(e));
}
