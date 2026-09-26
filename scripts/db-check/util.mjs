// Shared helpers for db-check. Node built-ins only, no dependencies.
// Created by skillkit init-project. Add a helper here rather than growing a rule file.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

export const sh = (cmd, cwd) => {
  try {
    return execSync(cmd, { encoding: "utf8", cwd, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
};

export const shLines = (cmd) => sh(cmd).split("\n").map((s) => s.trim()).filter(Boolean);

export const read = (f) => (existsSync(f) ? readFileSync(f, "utf8") : "");

export const readJson = (f) => {
  try {
    return JSON.parse(read(f) || "null");
  } catch {
    return null;
  }
};

export const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};

export const MAX_BYTES = 1024 * 1024; // 1 MB

const BINARY_EXT = /\.(png|jpg|jpeg|gif|webp|ico|svg|pdf|zip|gz|tgz|tar|woff2?|ttf|eot|mp4|webm|mp3|wasm|so|dylib|dll|exe|jar|pyc|lock|sqlite|db)$/i;
const SKIP_DIR = /(^|\/)(node_modules|\.git|\.next|dist|build|coverage|\.vercel|test-results|playwright-report)\//;

/** Text files worth scanning. Lockfiles and binaries are skipped. */
export const isScannable = (f) =>
  !SKIP_DIR.test(f) && !BINARY_EXT.test(f) && !/(^|\/)package-lock\.json$|(^|\/)pnpm-lock\.yaml$|(^|\/)yarn\.lock$|(^|\/)bun\.lockb?$/.test(f);

export const sizeOk = (f) => {
  try {
    return statSync(f).size <= MAX_BYTES;
  } catch {
    return false;
  }
};

/** Never print a secret: show only the first 4 characters. */
export const mask = (secret) => {
  const s = String(secret);
  return s.length <= 4 ? "****" : `${s.slice(0, 4)}****`;
};

// ---------------------------------------------------------------- SQL text --

/** Strip /* ... *\/ and -- ... comments, keeping line numbers intact. */
export function stripSqlComments(sql) {
  return sql
    .split("\n")
    .map((line) => {
      let out = "";
      let i = 0;
      let inStr = null;
      while (i < line.length) {
        const c = line[i];
        const two = line.slice(i, i + 2);
        if (inStr) {
          out += c;
          if (c === inStr) inStr = null;
          i += 1;
          continue;
        }
        if (c === "'" || c === '"') {
          inStr = c;
          out += c;
          i += 1;
          continue;
        }
        if (two === "--" || two === "/*") break;
        out += c;
        i += 1;
      }
      return out;
    })
    .join("\n");
}

/** Split SQL into statements with 1-based start line numbers. */
export function statements(sql) {
  const clean = stripSqlComments(sql).split("\n");
  const out = [];
  let cur = [];
  let start = 1;
  clean.forEach((line, i) => {
    const isBreak = /^\s*-->\s*statement-breakpoint\s*$/.test(line);
    if (isBreak || /;\s*$/.test(line)) {
      const text = [...cur, line.replace(/;?\s*$/, "")].join(" ").trim();
      if (text) out.push({ text, line: start });
      cur = [];
      start = i + 2;
      return;
    }
    cur.push(line);
    if (!cur[0].trim()) start = i + 1;
  });
  const tail = cur.join(" ").trim();
  if (tail) out.push({ text: tail, line: start });
  return out;
}

// ------------------------------------------------------------ opt-out tags --

/** `-- db-check:allow RULE reason words here` -> { RULE: true } (reason >= 3 words). */
export function allowedRules(sql) {
  const out = {};
  const re = /--\s*db-check:allow\s+([A-Z][A-Z0-9-]*)\s*(.*)$/gm;
  let m;
  while ((m = re.exec(sql))) {
    if (m[2].trim().split(/\s+/).length >= 3) out[m[1]] = true;
  }
  return out;
}

/** `db-check:allow SECRET-URL` on the same code line. */
export function lineAllows(line) {
  const m = /db-check:allow\s+([A-Z][A-Z0-9-]*)/.exec(line || "");
  return m ? m[1] : null;
}

// ------------------------------------------------------------------ output --

export const finding = (rule, file, line, message, fix) => ({
  rule,
  file,
  line: line || 0,
  message,
  fix,
  key: `${rule}|${file}`,
});
