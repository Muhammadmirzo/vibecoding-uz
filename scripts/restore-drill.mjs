#!/usr/bin/env node
// Backup restore drill: prove the dump actually restores and the row counts match.
// Read-only on the source. The source is never written to; only the TARGET is modified.
//
//   node scripts/restore-drill.mjs --source-env DATABASE_URL --target-url postgres://... --wipe-target
//   node scripts/restore-drill.mjs --dump backup.dump --target-url postgres://...
//   node scripts/restore-drill.mjs --docker --source-env DATABASE_URL
//
// Exit: 0 every table matches, 1 a mismatch, 2 tools missing, 3 refused (unsafe target).
// URLs are never printed with their passwords.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { loadDotEnv } from "./db-check/applied.mjs";

const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1] || true;
};
const has = (f) => argv.includes(f);
const ROOT = process.cwd();

/** host/db of a postgres URL, for the same-database check. */
function endpoint(url) {
  const m = /postgres(?:ql)?:\/\/[^@]*@?([^/]*)\/([^?]*)/.exec(String(url));
  if (!m) return null;
  const hostport = m[1] || "localhost:5432";
  const host = hostport.startsWith("[")
    ? hostport.slice(1, hostport.indexOf("]"))
    : hostport.split(":")[0];
  return `${host}/${m[2]}`;
}

/** Never log a password. */
function maskUrl(url) {
  return String(url).replace(/:\/\/([^:@/]+):[^@/]*@/, "://$1:****@");
}

const run = (bin, args, opts = {}) => {
  const r = spawnSync(bin, args, { encoding: "utf8", timeout: opts.timeout || 600000, ...opts });
  return { status: r.status, out: r.stdout || "", err: r.stderr || "" };
};

/** The useful line of a tool's stderr, not the last line of its stack/usage output. */
const errLine = (text) => {
  const lines = String(text || "").split("\n").map((s) => s.trim()).filter(Boolean);
  return (lines.find((l) => /error|fatal|refused|denied|no space|failed/i.test(l)) || lines[0] || "no output")
    .slice(0, 160);
};

const psql = (url, sql) => {
  const r = run("psql", [url, "-tAc", sql], {
    timeout: 30000,
    env: { ...process.env, PGCONNECT_TIMEOUT: "10" },
  });
  if (r.status !== 0) throw new Error(errLine(r.err) || "psql failed");
  return r.out.trim();
};

/** Every user table in public, plus auth if that schema exists. */
function tables(url) {
  const sql = `select table_schema || '.' || table_name from information_schema.tables
    where table_schema in ('public','auth') and table_type='BASE TABLE' order by 1`;
  return psql(url, sql).split("\n").map((s) => s.trim()).filter(Boolean);
}

const counts = (url, list) => {
  const out = {};
  for (const t of list) {
    const n = psql(url, `select count(*) from ${t}`);
    out[t] = Number(n);
  }
  return out;
};

function requireTools(tools) {
  const missing = tools.filter((t) => run("sh", ["-c", `command -v ${t}`]).status !== 0);
  if (missing.length) {
    console.error(`restore-drill: missing ${missing.join(", ")}`);
    console.error("install the postgres client tools:\n  sudo apt install postgresql-client-17");
    return false;
  }
  return true;
}

async function dockerTarget() {
  const port = 34000 + Math.floor(Math.random() * 2000);
  const name = `restore-drill-${Date.now()}`;
  const up = run("docker", ["run", "-d", "--rm", "--name", name, "-e", "POSTGRES_PASSWORD=drill", "-p", `${port}:5432`, "postgres:17"]);
  if (up.status !== 0) throw new Error(`docker run failed: ${errLine(up.err)}`);
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (run("docker", ["exec", name, "pg_isready", "-U", "postgres"]).status === 0) break;
    if (i === 39) throw new Error("postgres:17 did not become ready in 40s");
  }
  return { name, url: `postgres://postgres:drill@127.0.0.1:${port}/postgres` };
}

async function main() {
  const env = { ...loadDotEnv(ROOT), ...process.env };
  const dumpArg = opt("--dump");
  const docker = has("--docker");
  if (!requireTools(["pg_dump", "pg_restore", "psql"])) return 2;

  const sourceEnv = opt("--source-env");
  const source = dumpArg ? null : env[sourceEnv || "DATABASE_URL"];
  if (!dumpArg && !source) {
    console.error(`restore-drill: ${sourceEnv || "DATABASE_URL"} is not set and no --dump was given`);
    return 2;
  }

  let container = null;
  let target = opt("--target-url");
  if (!target) {
    if (!docker) {
      console.error("restore-drill: pass --target-url <url> or --docker (to use a throwaway postgres:17)");
      return 2;
    }
    if (!requireTools(["docker"])) return 2;
    container = await dockerTarget();
    target = container.url;
  }

  const tmp = mkdtempSync(path.join(tmpdir(), "restore-drill-"));
  const dump = dumpArg && !existsSync(path.join(ROOT, dumpArg)) ? dumpArg : path.join(tmp, "dump.bak");
  try {
    if (source) {
      const src = endpoint(source);
      const dst = endpoint(target);
      if (src && dst && src === dst) {
        console.error(`restore-drill: refused. source and target are the same database (${src}). Restoring would overwrite the source.`);
        return 3;
      }
      const existing = tables(target).filter((t) => t.startsWith("public."));
      if (existing.length) {
        if (!has("--wipe-target")) {
          console.error(`restore-drill: refused. target has ${existing.length} table(s). Re-run with --wipe-target to DROP SCHEMA public on the TARGET only.`);
          return 3;
        }
        console.log(`note  --wipe-target given: dropping schema public on the target (${existing.length} table(s))`);
        psql(target, "drop schema public cascade; create schema public;");
      }
      console.log(`dump  pg_dump -Fc from ${maskUrl(source)} (read-only)`);
      const d = run("pg_dump", [source, "-Fc", "--no-owner", "--no-privileges", "-f", dump], { timeout: 900000 });
      if (d.status !== 0) {
        console.error(`restore-drill: pg_dump failed: ${errLine(d.err)}`);
        return 1;
      }
      if (!existsSync(dump)) {
        console.error("restore-drill: pg_dump reported success but wrote no dump file. Check disk space and permissions.");
        return 1;
      }
    } else {
      console.log(`dump  using --dump ${dumpArg} (read-only)`);
    }

    const bytes = statSync(dump).size;
    const started = Date.now();
    console.log(`dump  size ${(bytes / 1048576).toFixed(2)} MB from ${dump}`);
    console.log(`step  pg_restore into the target (${maskUrl(target)})`);
    const r = run("pg_restore", ["-d", target, "--no-owner", "--no-privileges", dump], { timeout: 900000 });
    if (r.status !== 0 && !/error|warning/i.test(r.err)) {
      console.error(`restore-drill: pg_restore failed: ${errLine(r.err)}`);
      return 1;
    }
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`step  restored in ${secs}s`);

    const dstTables = tables(target);
    const list = source ? [...new Set([...tables(source), ...dstTables])] : dstTables;
    const srcCounts = source ? counts(source, list) : null;
    const dstCounts = counts(target, list);

    console.log("");
    console.log("table | source | restored | ok");
    let bad = 0;
    for (const t of list) {
      const a = srcCounts ? srcCounts[t] : null;
      const b = dstCounts[t];
      const ok = a === null ? "n/a" : a === b ? "yes" : "NO";
      if (ok === "NO") bad++;
      console.log(`${t} | ${a === null ? "-" : a} | ${b} | ${ok}`);
    }
    console.log("");
    if (bad) {
      console.error(`restore-drill: FAIL ${bad} table(s) do not match. A backup you cannot count is not a backup.`);
      return 1;
    }
    if (!list.length) {
      console.error("restore-drill: FAIL the restore produced no tables at all. The dump is not usable.");
      return 1;
    }
    if (!srcCounts) {
      // --dump only: the restore worked, but nothing was compared, so do not claim it verified
      console.log(`restore-drill: restored ${list.length} table(s) from ${(bytes / 1048576).toFixed(2)} MB in ${secs}s,`);
      console.log("restore-drill: NOT VERIFIED - no source database to compare against (--dump only).");
      console.log("restore-drill: re-run with --source-env DATABASE_URL to prove the row counts match.");
      return 0;
    }
    console.log(`restore-drill: OK ${list.length} table(s) match. dump ${(bytes / 1048576).toFixed(2)} MB, ${secs}s.`);
    return 0;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
    if (container) run("docker", ["rm", "-f", container.name]);
  }
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(`restore-drill: ${e.message || e}`);
    process.exit(2);
  },
);
