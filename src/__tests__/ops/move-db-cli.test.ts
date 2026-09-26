import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * End-to-end on the CLI (no pg_dump, no real database): errors must be clear, exit codes stable,
 * and no password may ever appear in the output.
 */
const root = path.resolve(__dirname, "../../..");
const PASSWORD = "Zq7-not-a-real-pw";
/** Built at runtime so no credential-looking literal sits in the source (lessons L15). */
const url = (user: string, rest: string) => ["postgres://", user, ":", PASSWORD, "@", rest].join("");

function run(args: string[], env: Record<string, string>) {
  const r = spawnSync(path.join(root, "node_modules/.bin/tsx"), [path.join(root, "scripts/ops/move-db.ts"), ...args], {
    cwd: path.join(root, "src"), // no .env here: only the env we pass
    env: { NODE_ENV: "test", PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "", ...env },
    encoding: "utf8",
    timeout: 60_000,
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

describe("move-db CLI", () => {
  it("usage error (exit 2) when the target env var is missing", () => {
    const r = run(["--to", "NEW_DATABASE_URL", "--dry-run"], { DATABASE_URL: url("u", "127.0.0.1:1/db") });
    expect(r.code).toBe(2);
    expect(r.out).toMatch(/NEW_DATABASE_URL is empty or not set/);
    expect(r.out).not.toContain(PASSWORD);
  });

  it("refuses a URL on the command line (exit 2)", () => {
    const r = run(["--to", url("u", "h/db")], {});
    expect(r.code).toBe(2);
    expect(r.out).not.toContain(PASSWORD);
  });

  it("dry run against an unreachable server fails cleanly and masks the password", () => {
    const r = run(["--to", "NEW_DATABASE_URL", "--dry-run"], {
      DATABASE_URL: url("u", "127.0.0.1:1/db"),
      NEW_DATABASE_URL: url("v", "127.0.0.1:2/db"),
    });
    expect(r.code).toBe(1);
    expect(r.out).toContain("postgres://u:***@127.0.0.1:1/db");
    expect(r.out).toMatch(/dry run continues|pg_dump/);
    expect(r.out).not.toContain(PASSWORD);
  });

  it("refuses a plaintext remote target before connecting", () => {
    const r = run(["--to", "NEW_DATABASE_URL", "--dry-run"], {
      DATABASE_URL: url("u", "127.0.0.1:1/db"),
      NEW_DATABASE_URL: url("v", "db.example.com/db?sslmode=disable"),
    });
    expect(r.code).toBe(2);
    expect(r.out).toMatch(/sslmode=disable is refused/);
    expect(r.out).not.toContain(PASSWORD);
  });
});
