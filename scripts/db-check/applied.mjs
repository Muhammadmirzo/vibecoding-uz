// `--applied`: compare migrations on disk with the migration table in the live database.
// Read-only: SELECT statements only, 10s connect timeout, the URL is never printed.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { detect } from "./detect.mjs";
import { mask } from "./util.mjs";

/** Minimal KEY=VALUE reader for a .env file. */
export function loadDotEnv(root) {
  const f = path.join(root, ".env");
  if (!existsSync(f)) return {};
  const out = {};
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = /^\s*([A-Za-z_][\w]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || line.trim().startsWith("#")) continue;
    out[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
  return out;
}

const has = (cmd) => spawnSync("sh", ["-c", `command -v ${cmd}`], { encoding: "utf8" }).status === 0;

/** Run the query in a child process: it needs a 10s connect timeout, must not leave a
 * connection open, and keeps the URL out of this process's argv. SELECT only, always. */
const NODE_DRIVER = `
import { pathToFileURL } from "node:url";
const { default: postgres } = await import(pathToFileURL(process.env.__DB_DRIVER).href);
const sql = postgres(process.env.__DB_URL, { connect_timeout: 10, max: 1, prepare: false });
try {
  const rows = await sql.unsafe(process.env.__SQL);
  process.stdout.write(JSON.stringify(rows));
} catch (e) {
  process.stderr.write("DBERR: " + (e && e.message ? e.message : String(e)));
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
`;

/** The useful line of an error, not the last line of a stack trace. */
function errLine(text) {
  const lines = String(text || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const marked = lines.find((l) => l.startsWith("DBERR:"));
  if (marked) return marked.slice(6);
  return (lines.find((l) => /error|ECONNREFUSED|password|does not exist|timeout|failed/i.test(l)) || lines[0] || "failed")
    .replace(/^(psql:|error:)\s*/i, "")
    .slice(0, 140);
}

/** Resolve the repo's own `postgres` package, if it has one. */
function driverModule(root) {
  try {
    return createRequire(path.join(root, "package.json")).resolve("postgres");
  } catch {
    return null;
  }
}

/** A driver is available if psql is on PATH or the repo depends on `postgres`. */
export function hasDriver(root) {
  return has("psql") || !!driverModule(root);
}

/** Run one SELECT and return rows as objects. */
function query(root, url, sqlText) {
  if (has("psql")) {
    const r = spawnSync("psql", [url, "-tAc", sqlText], {
      encoding: "utf8",
      timeout: 10000,
      env: { ...process.env, PGCONNECT_TIMEOUT: "10" },
    });
    if (r.status !== 0) throw new Error(errLine(r.stderr) || "psql failed");
    return r.stdout.trim().split("\n").filter(Boolean).map((l) => ({ v: l.trim() }));
  }
  const driver = driverModule(root);
  if (!driver) throw new Error("no database driver available");
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", NODE_DRIVER], {
    encoding: "utf8",
    timeout: 15000,
    env: { ...process.env, __DB_DRIVER: driver, __DB_URL: url, __SQL: sqlText },
  });
  if (r.status !== 0) throw new Error(errLine(r.stderr) || "the postgres driver failed");
  return JSON.parse(r.stdout || "[]");
}

/** The single scalar of a one-row SELECT, as a string. Throws if the shape is not what we asked
 * for, so a wrong column alias can never be read as a legitimate zero. */
const scalar = (root, url, sqlText) => {
  const rows = query(root, url, sqlText);
  const v = rows[0]?.v;
  if (v === undefined || v === null || v === "") throw new Error(`query returned no usable value: ${sqlText}`);
  return String(v);
};

/**
 * Returns { code, line } where code: 0 all applied, 4 pending, 3 unknown.
 * Never throws.
 */
export function applied(root) {
  const env = { ...loadDotEnv(root), ...process.env };
  const url = env.DATABASE_URL;
  const det = detect(root);
  if (!url) return { code: 3, line: "UNKNOWN: DATABASE_URL is not set (and no .env in the repo root)" };
  if (!hasDriver(root)) return { code: 3, line: `UNKNOWN: neither the postgres npm package nor psql is available (${mask(url.slice(0, 4))} set)` };
  const journalEntries = (() => {
    if (!det.journal) return [];
    try {
      return (JSON.parse(readFileSync(path.join(root, det.journal), "utf8")) || {}).entries || [];
    } catch {
      return [];
    }
  })();

  try {
    if (det.kind === "drizzle") {
      const n = Number(scalar(root, url, "select count(*) as v from drizzle.__drizzle_migrations"));
      const want = journalEntries.length;
      const lastWhen = journalEntries.length ? journalEntries[journalEntries.length - 1].when : 0;
      if (n !== want) {
        // match on the journal `when` timestamp: that is what drizzle stores in created_at
        const live = new Set(query(root, url, "select created_at as v from drizzle.__drizzle_migrations")
          .map((r) => String(Number(r.v))));
        const pending = journalEntries.filter((e) => !live.has(String(Number(e.when)))).map((e) => e.tag);
        return { code: 4, line: `PENDING: ${pending.length} migration(s) not applied: ${pending.join(", ") || "(journal and table disagree)"}` };
      }
      const last = Number(scalar(root, url, "select created_at as v from drizzle.__drizzle_migrations order by created_at desc limit 1"));
      const drift = last && lastWhen && Math.abs(last - Number(lastWhen)) > 1000;
      return { code: 0, line: `APPLIED: all ${n} migrations are live${drift ? " (the last created_at differs from the journal when; re-run migrate)" : ""}` };
    }
    if (det.kind === "supabase") {
      const versions = new Set(
        query(root, url, "select version as v from supabase_migrations.schema_migrations").map((r) => r.v),
      );
      const applied = det.migrations.filter((f) => {
        const v = (f.match(/^\d+/) || [])[0];
        return v && versions.has(v.padStart(14, "0"));
      });
      if (applied.length === det.migrations.length) return { code: 0, line: `APPLIED: all ${det.migrations.length} migrations are live` };
      return { code: 4, line: `PENDING: ${det.migrations.length - applied.length} migration(s) not applied` };
    }
    return { code: 3, line: `UNKNOWN: no drizzle or supabase migrations detected (${det.kind})` };
  } catch (e) {
    return { code: 3, line: `UNKNOWN: ${String(e.message || e).split("\n")[0].slice(0, 120)}` };
  }
}
