/**
 * Small runtime helpers shared by the ops entry points: .env loading, env resolution, confirmation,
 * age encryption of kept files, and the top-level error handler.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, chmodSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { UsageError } from "./args";
import { assertNotTransactionPooler, parseConnUrl, toSessionConnection, type ConnInfo } from "./conn";
import { maskUrl, redact, secretsOf } from "./mask";
import { ToolMissingError } from "./pgtools";
import { ageEncryptArgs, parseAgeRecipients } from "./tempdir";

export const log = (line: string) => console.log(line);

/** Loads ./.env if present (local runs). Existing env always wins; CI has no .env file. */
export function loadDotEnv(): void {
  const file = path.resolve(".env");
  if (existsSync(file) && typeof process.loadEnvFile === "function") process.loadEnvFile(file);
}

export interface ResolvedConn {
  envName: string;
  raw: string;
  info: ConnInfo;
}

/**
 * Reads a connection from an env var NAME. With `session: true` Supabase's transaction pooler is
 * switched to the session port, and a remaining 6543 is refused.
 */
export function resolveConn(envName: string, label: string, opts: { session: boolean }): ResolvedConn {
  const raw = process.env[envName];
  if (!raw) throw new UsageError(`${label}: env var ${envName} is empty or not set / ${envName} o'rnatilmagan`);
  let info = parseConnUrl(raw, label);
  if (opts.session) {
    const s = toSessionConnection(info);
    if (s.switched) log(`  ${label}: transaction pooler 6543 → session pooler 5432 (needed for pg_dump/snapshots)`);
    info = s.info;
    assertNotTransactionPooler(info, label);
  }
  log(`  ${label} (${envName}): ${maskUrl(raw)}${info.port !== Number(new URL(raw).port || 5432) ? ` [port ${info.port}]` : ""}`);
  return { envName, raw, info };
}

export function secretsFor(...conns: ResolvedConn[]): string[] {
  return conns.flatMap((c) => secretsOf(c.raw));
}

/** Irreversible steps need an explicit "KOCHIR" (or --yes in automation). */
export async function confirmOrExit(yes: boolean, question: string): Promise<void> {
  if (yes) return;
  if (!process.stdin.isTTY) {
    throw new UsageError("not a terminal: re-run with --yes to confirm / tasdiqlash uchun --yes qo'shing");
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question}\nTasdiqlash uchun KOCHIR deb yozing / type KOCHIR to continue: `);
  rl.close();
  if (answer.trim() !== "KOCHIR") throw new UsageError("not confirmed, nothing was changed / bekor qilindi, hech narsa o'zgarmadi");
}

/** Encrypts files with age into outDir (0700). Plain inputs stay in the scratch dir and die with it. */
export function encryptInto(outDir: string, files: string[], recipientsEnv = "BACKUP_AGE_RECIPIENTS"): string[] {
  const recipients = parseAgeRecipients(process.env[recipientsEnv]);
  if (!recipients.length) throw new UsageError(`${recipientsEnv} is empty: refusing to keep an unencrypted dump`);
  mkdirSync(outDir, { recursive: true, mode: 0o700 });
  chmodSync(outDir, 0o700);
  return files.map((file) => {
    const out = path.join(outDir, `${path.basename(file)}.age`);
    const r = spawnSync("age", ageEncryptArgs(recipients, file, out), { encoding: "utf8" });
    if (r.status !== 0) throw new Error(`age encryption failed: ${(r.stderr || r.error?.message || "").trim()}`);
    chmodSync(out, 0o600);
    return out;
  });
}

/** Prints a friendly bilingual error (never the stack with URLs) and sets the exit code. */
export function exitWithError(error: unknown, secrets: string[] = []): never {
  const msg = error instanceof Error ? error.message : String(error);
  const kind = error instanceof UsageError ? "USAGE" : error instanceof ToolMissingError ? "MISSING TOOL" : "FAILED";
  console.error(`\n✖ ${kind}: ${redact(msg, secrets)}`);
  process.exit(error instanceof UsageError ? 2 : 1);
}
