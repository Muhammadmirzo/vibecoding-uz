import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Whole-word typo guard. Runs on the tracked `src` tree so a stale word can
 * never come back through a copy edit (g1b, from the m1 growth audit).
 */
const TYPOS: [RegExp, string][] = [
  [/\bqarar\b/i, "qaror"],
  [/\brozik\b/i, "rozilik"],
  [/\bshu yerde\b/i, "shu yerda"],
  [/\bboshlaganizdan\b/i, "boshlaganingizdan"],
  [/\bResurdan\b/i, "Resursdan"],
];

/** Tracked + untracked-but-not-ignored files, so new copy is checked too. */
function sourceFiles(): string[] {
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "src"], {
    encoding: "utf8",
  })
    .split("\n")
    .filter((file) => /\.(ts|tsx|md|json|css)$/.test(file));
}

describe("Uzbek copy typos (g1b)", () => {
  const files = sourceFiles();

  it("has source files to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  for (const [pattern, correct] of TYPOS) {
    it(`no longer writes ${pattern.source} (correct: ${correct})`, () => {
      const offenders: string[] = [];
      for (const file of files) {
        const source = readFileSync(join(process.cwd(), file), "utf8");
        if (pattern.test(source)) offenders.push(file);
      }
      expect(offenders).toEqual([]);
    });
  }
});
