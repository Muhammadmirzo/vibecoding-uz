/**
 * Locating and running pg_dump / pg_restore / age. Nothing here ever puts a secret in argv:
 * connection details travel through env (PGHOST…) and a 0600 PGPASSFILE.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { redact } from "./mask";

export const MIN_PG_MAJOR = 17;

export class ToolMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolMissingError";
  }
}

/** "pg_dump (PostgreSQL) 17.6 (Ubuntu 17.6-1.pgdg24.04+1)" → 17. */
export function parseToolMajor(versionOutput: string): number | null {
  const m = versionOutput.match(/\(PostgreSQL\)\s+(\d+)(?:\.\d+)?/);
  return m ? Number(m[1]) : null;
}

const CANDIDATE_DIRS = [
  "/usr/lib/postgresql/17/bin",
  "/usr/lib/postgresql/18/bin",
  "/opt/homebrew/opt/postgresql@17/bin",
  "/usr/local/opt/postgresql@17/bin",
  "/opt/homebrew/opt/libpq/bin",
];

function candidates(tool: string): string[] {
  const list: string[] = [];
  if (process.env.PG_BIN) list.push(path.join(process.env.PG_BIN, tool));
  for (const dir of CANDIDATE_DIRS) list.push(path.join(dir, tool));
  list.push(tool); // PATH lookup last: Debian's pg_wrapper may point at an older client
  return list;
}

export interface PgTools {
  pgDump: string;
  pgRestore: string;
  major: number;
}

function probe(bin: string): number | null {
  if (bin.includes("/") && !existsSync(bin)) return null;
  const r = spawnSync(bin, ["--version"], { encoding: "utf8" });
  return r.status === 0 ? parseToolMajor(r.stdout) : null;
}

export function findPgTools(minMajor = MIN_PG_MAJOR): PgTools {
  const pick = (tool: string) => {
    for (const bin of candidates(tool)) {
      const major = probe(bin);
      if (major !== null && major >= minMajor) return { bin, major };
    }
    return null;
  };
  const dump = pick("pg_dump");
  const restore = pick("pg_restore");
  if (!dump || !restore) {
    throw new ToolMissingError(
      `pg_dump and pg_restore version ${minMajor}+ are required but were not found.\n` +
        `  UZ: bu kompyuterda pg_dump/pg_restore ${minMajor}+ yo'q. Eng oson yo'l: GitHub orqali ishga tushiring:\n` +
        `      gh workflow run move-db -f dry_run=true\n` +
        `  EN: install postgresql-client-${minMajor} (Ubuntu: PGDG apt repo; macOS: brew install postgresql@${minMajor}),\n` +
        `      or set PG_BIN=/path/to/postgresql/${minMajor}/bin, or run the GitHub workflow above.`,
    );
  }
  return { pgDump: dump.bin, pgRestore: restore.bin, major: Math.min(dump.major, restore.major) };
}

export function hasAge(): boolean {
  return spawnSync("age", ["--version"], { encoding: "utf8" }).status === 0;
}

const PASS_THROUGH_ENV = [
  "PATH", "HOME", "TMPDIR", "LANG", "LC_ALL", "LD_LIBRARY_PATH", "DYLD_LIBRARY_PATH", "PGSSLROOTCERT",
] as const;

/** Runs a tool, streams nothing, returns stdout; stderr is redacted into the error on failure. */
export function runTool(
  bin: string, args: string[], env: Record<string, string>, secrets: string[],
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Minimal env: no app secrets leak into child processes (only what libpq/locale need).
    const base: Record<string, string> = {};
    for (const key of PASS_THROUGH_ENV) {
      const value = process.env[key];
      if (value) base[key] = value;
    }
    Object.assign(base, env);
    const childEnv = base as unknown as NodeJS.ProcessEnv;
    const child = spawn(bin, args, { env: childEnv, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (d: Buffer) => { out += d.toString(); });
    child.stderr.on("data", (d: Buffer) => { err += d.toString(); });
    child.on("error", (e) => reject(new Error(`${path.basename(bin)} could not start: ${e.message}`)));
    child.on("close", (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(`${path.basename(bin)} failed (exit ${code}):\n${redact(err.trim(), secrets).slice(-4000)}`));
    });
  });
}

/**
 * Comments out TOC entries we must not replay on the target: the `public` schema itself (it already
 * exists everywhere) and its comment. Format per pg_restore docs: `;` at line start disables an entry.
 */
export function filterToc(list: string): string {
  return list
    .split("\n")
    .map((line) => (/^\d+;\s.*\b(SCHEMA - public|COMMENT - SCHEMA public)\b/.test(line) ? `;${line}` : line))
    .join("\n");
}

export function dumpArgs(file: string, snapshot: string | null, schemas: readonly string[]): string[] {
  return [
    "--format=custom",
    "--no-owner",
    "--no-privileges",
    "--no-publications",
    "--no-subscriptions",
    "--quote-all-identifiers",
    "--lock-wait-timeout=60s",
    ...schemas.map((s) => `--schema=${s}`),
    ...(snapshot ? [`--snapshot=${snapshot}`] : []),
    `--file=${file}`,
  ];
}

export function restoreArgs(file: string, listFile: string, database: string): string[] {
  return [
    "--no-owner",
    "--no-privileges",
    "--single-transaction",
    "--exit-on-error",
    `--use-list=${listFile}`,
    `--dbname=${database}`,
    file,
  ];
}
