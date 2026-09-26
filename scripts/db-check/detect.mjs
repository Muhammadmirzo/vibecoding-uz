// Find the database setup: which migrations folder, which schema files, which journal.
// Node built-ins only. Override anything with "db": {...} in .skillkit.json:
//   { "db": { "migrations": "drizzle", "schema": ["src/db/schema.ts"], "journal": "drizzle/meta/_journal.json" } }
import { existsSync } from "node:fs";
import path from "node:path";

import { isDir, read, readJson, shLines } from "./util.mjs";

const unquote = (s) => String(s || "").replace(/^['"]|['"]$/g, "").trim();

// Paths must be repo-relative and slash-normalised to match `git ls-files` output,
// otherwise a schema detected as "./src/db/schema.ts" never matches the staged "src/db/schema.ts".
const norm = (p) => String(p || "").replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "");

function expandGlobs(root, patterns) {
  const files = shLines("git ls-files").map(norm);
  const out = [];
  for (const raw of patterns) {
    const pat = norm(raw);
    if (pat.includes("*")) {
      const re = new RegExp(`^${pat.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*").replace(/\?/g, ".")}$`);
      out.push(...files.filter((f) => re.test(f)));
    } else if (files.includes(pat) || existsSync(path.join(root, pat))) {
      out.push(pat);
    }
  }
  return [...new Set(out)];
}

function sqlFiles(root, dir) {
  const tracked = shLines("git ls-files");
  return tracked.filter((f) => f.startsWith(`${dir}/`) && f.endsWith(".sql")).sort();
}

function drizzle(root) {
  const cfgName = shLines("git ls-files").find((f) => /^drizzle\.config\.[cm]?[jt]s$/.test(f));
  if (!cfgName) return null;
  const text = read(cfgName);
  const out = norm(unquote((/out:\s*['"`]([^'"`]+)/.exec(text) || [])[1]));
  const schemaRaw = (/(?:schema|schemas):\s*(\[[^\]]*\]|['"`][^'"`]+['"`])/.exec(text) || [])[1] || "";
  const schema = expandGlobs(root, (schemaRaw.match(/['"`]([^'"`]+)/g) || []).map(unquote));
  if (!out) return null;
  const dir = out.replace(/\/$/, "");
  return {
    kind: "drizzle",
    migrationsDir: dir,
    journal: path.join(dir, "meta", "_journal.json"),
    schema: schema.length ? schema : expandGlobs(root, ["drizzle/schema.ts", "src/db/schema.ts"]),
  };
}

function supabase(root) {
  const dir = "supabase/migrations";
  if (!isDir(path.join(root, dir))) return null;
  return { kind: "supabase", migrationsDir: dir, journal: "", schema: expandGlobs(root, ["supabase/**/*.sql"]) };
}

function prisma(root) {
  const dir = "prisma/migrations";
  const schema = existsSync(path.join(root, "prisma/schema.prisma")) ? ["prisma/schema.prisma"] : [];
  if (!isDir(path.join(root, dir)) && !schema.length) return null;
  return { kind: "prisma", migrationsDir: dir, journal: "", schema };
}

/** Returns { kind, migrationsDir, journal, schema, migrations[] } or null. */
export function detect(root) {
  const cfg = readJson(path.join(root, ".skillkit.json")) || {};
  const db = cfg.db || {};
  const found = drizzle(root) || supabase(root) || prisma(root);
  const migrationsDir = db.migrations || (found && found.migrationsDir) || "";
  const schema = db.schema ? expandGlobs(root, [].concat(db.schema)) : (found && found.schema) || [];
  const journal = db.journal || (found && found.journal) || "";
  const kind = db.kind || (found && found.kind) || "";
  const migrations = migrationsDir ? sqlFiles(root, migrationsDir) : [];
  return {
    kind: kind || "none",
    migrationsDir,
    schema,
    journal,
    migrations,
    notes: kind ? [`detected ${kind}`] : [],
  };
}
