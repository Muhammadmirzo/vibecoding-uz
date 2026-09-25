#!/usr/bin/env node
// Automated checks for naqsh-lessons (.claude/skills/naqsh-lessons/SKILL.md).
// Usage: node scripts/lessons-check.mjs            -> whole repo (CI)
//        node scripts/lessons-check.mjs --staged   -> only staged files (pre-commit)
// Known debt lives in scripts/lessons-baseline.json: it is reported, but it does not fail the run.
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const staged = process.argv.includes("--staged");
const sh = (cmd) => execSync(cmd, { encoding: "utf8" }).split("\n").filter(Boolean);
const tracked = sh("git ls-files");
const files = staged ? sh("git diff --cached --name-only --diff-filter=ACMR") : tracked;
const read = (f) => (existsSync(f) ? readFileSync(f, "utf8") : "");
const baseline = JSON.parse(read("scripts/lessons-baseline.json") || "{}");
const IGNORE = "lessons-ignore";

const isSrc = (f) => /^src\/.*\.(ts|tsx)$/.test(f);
const failures = [];
const debt = [];
function hit(lesson, file, msg) {
  (baseline[lesson]?.includes(file) ? debt : failures).push(`${lesson} ${file}: ${msg}`);
}
function grepLines(file, re, lesson, msg) {
  read(file).split("\n").forEach((line, i) => {
    if (re.test(line) && !line.includes(IGNORE)) hit(lesson, file, `${msg} (line ${i + 1})`);
  });
}

for (const f of files) {
  if (isSrc(f)) {
    // L6: design tokens only, no hard-coded hex classes
    grepLines(f, /(text|bg|border|from|to|via|fill|stroke)-\[#/, "L6", "hard-coded hex class; use a design token");
    // L15: no real credentials in code (localhost dev fallback is allowed)
    // (passwords shorter than 6 chars are test dummies)
    grepLines(f, /postgres(ql)?:\/\/[^\s:"'`]+:[^\s@"'`]{6,}@(?!localhost)/, "L15", "database URL with a password");
    // L19: one responsibility per file
    const n = read(f).split("\n").length;
    if (n > 250) hit("L19", f, `${n} lines (max 250); split the file`);
  }
  // L13: a dynamic page must 404 on unknown ids
  if (/^src\/app\/.*\[[^\]]+\].*\/page\.tsx$/.test(f) && !/notFound\(|redirect\(/.test(read(f))) {
    hit("L13", f, "dynamic page never calls notFound(); unknown ids return 200 (soft-404)");
  }
  // L15: never commit env files
  if (/(^|\/)\.env(\.|$)/.test(f) && !f.endsWith(".env.example")) hit("L15", f, "env file must not be committed");
  // L3 (ZAHAR ledger): no machine-specific links in docs
  if (f.endsWith(".md")) grepLines(f, /\]\(file:\/\/\/home/, "DOC", "absolute local file link");
}

// L16: functions stay next to the database
if (!staged || files.includes("vercel.json")) {
  if (!/"syd1"/.test(read("vercel.json"))) failures.push('L16 vercel.json: region "syd1" missing');
}

for (const d of debt) console.log(`debt  ${d}`);
for (const f of failures) console.log(`FAIL  ${f}`);
console.log(`lessons-check: ${failures.length} failure(s), ${debt.length} known debt (${staged ? "staged" : "repo"})`);
process.exit(failures.length ? 1 : 0);
