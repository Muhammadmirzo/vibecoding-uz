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
  // L23: every table created from migration 0014 on must enable RLS in the same migration
  const mig = /^drizzle\/(\d{4})_.*\.sql$/.exec(f);
  if (mig && Number(mig[1]) >= 14 && /CREATE TABLE/i.test(read(f)) && !/ENABLE ROW LEVEL SECURITY/i.test(read(f))) {
    hit("L23", f, "CREATE TABLE without ENABLE ROW LEVEL SECURITY (Supabase Data API would expose it)");
  }
  // L3 (SARBON ledger): no machine-specific links in docs
  if (f.endsWith(".md")) grepLines(f, /\]\(file:\/\/\/home/, "DOC", "absolute local file link");
}

// L16: functions stay next to the database
if (!staged || files.includes("vercel.json")) {
  if (!/"syd1"/.test(read("vercel.json"))) failures.push('L16 vercel.json: region "syd1" missing');
}

// L27: an in-page anchor the site chrome deep-links to must exist as an id in
// src. Deleting a section that owned an id (e.g. the old <Pricing id="kurs-tanlash">)
// silently kills the nav link, the header CTA, the mobile drawer entry and the
// CRM's default headerCtaLink at once, and nothing else notices.
if (!staged) {
  const wanted = new Set();
  for (const f of sh("git ls-files 'src/components/layout' 'src/features/crm' 'src/config' 'src/components/ui'")) {
    for (const m of read(f).matchAll(/["'`]\/(#[a-z0-9][a-z0-9-]*)["'`]/g)) wanted.add(m[1].slice(1));
  }
  const ids = new Set();
  for (const f of sh("git ls-files 'src/*.tsx' 'src/**/*.tsx'")) {
    for (const m of read(f).matchAll(/\bid=["'{]([a-z0-9][a-z0-9-]*)["'}]/g)) ids.add(m[1]);
  }
  for (const a of wanted) {
    if (!ids.has(a)) failures.push(`L27 site chrome deep-links to /#${a} but no id="${a}" exists in any src/**/*.tsx`);
  }
}

for (const d of debt) console.log(`debt  ${d}`);
for (const f of failures) console.log(`FAIL  ${f}`);
console.log(`lessons-check: ${failures.length} failure(s), ${debt.length} known debt (${staged ? "staged" : "repo"})`);
process.exit(failures.length ? 1 : 0);
