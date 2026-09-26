import { describe, expect, it } from "vitest";
import { envName, parseFlags, parseMoveArgs, UsageError } from "../../../scripts/ops/lib/args";
import { parseWrapperArgs } from "../../../scripts/ops/move";

describe("move-db argument parsing", () => {
  it("parses a real move with defaults (freeze on, not dry)", () => {
    expect(parseMoveArgs(["--to", "NEW_DATABASE_URL"])).toEqual({
      to: "NEW_DATABASE_URL", from: undefined, dryRun: false, yes: false, freeze: true, unfreeze: false, keepDump: undefined,
    });
  });

  it("parses --flag=value, --dry-run, --no-freeze, --yes", () => {
    const a = parseMoveArgs(["--to=NEW_DB", "--from", "OLD_DB", "--dry-run", "--no-freeze", "--yes"]);
    expect(a).toMatchObject({ to: "NEW_DB", from: "OLD_DB", dryRun: true, freeze: false, yes: true });
  });

  it("refuses a literal URL instead of an env var name (shell history)", () => {
    expect(() => parseMoveArgs(["--to", "postgres://u:pw@h/db"])).toThrow(/NAME of an env var/);
    expect(() => envName("--to", "user:pass@host")).toThrow(UsageError);
  });

  it("never echoes a stray URL argument back", () => {
    try {
      parseMoveArgs(["postgres://u:secretpw@h/db"]); // lessons-ignore: test dummy
      throw new Error("should have thrown");
    } catch (e) {
      expect((e as Error).message).not.toContain("secretpw");
    }
  });

  it("requires --to, rejects unknown flags and --allow-nonempty", () => {
    expect(() => parseMoveArgs([])).toThrow(/--to/);
    expect(() => parseMoveArgs(["--to", "X_URL", "--force"])).toThrow(/unknown flag/);
    expect(() => parseMoveArgs(["--to", "X_URL", "--allow-nonempty"])).toThrow(/refused/);
    expect(() => parseMoveArgs(["--to", "X_URL", "--from", "X_URL"])).toThrow(/same env var/);
  });

  it("--unfreeze runs alone", () => {
    expect(parseMoveArgs(["--unfreeze", "--yes"])).toMatchObject({ unfreeze: true, yes: true });
    expect(() => parseMoveArgs(["--unfreeze", "--to", "X_URL"])).toThrow(/alone/);
  });

  it("bool flags take no value; value flags need one", () => {
    expect(() => parseFlags(["--yes=1"], { yes: "bool" } as const)).toThrow(/no value/);
    expect(() => parseFlags(["--out"], { out: "path" } as const)).toThrow(/needs a value/);
    expect(() => envName("--to", "lower_case")).toThrow(/not a valid env var name/);
  });
});

describe("owner wrapper (npm run move)", () => {
  it("forwards db flags to move-db and keeps wrapper flags", () => {
    const w = parseWrapperArgs(["db", "--to", "NEW_DATABASE_URL", "--switch-vercel", "--app-url-env", "NEW_APP_URL"]);
    expect(w).toMatchObject({ sub: "db", switchVercel: true, appUrlEnv: "NEW_APP_URL", to: "NEW_DATABASE_URL" });
    expect(w.passThrough).toEqual(["--to", "NEW_DATABASE_URL"]);
  });

  it("shows help without arguments and rejects unknown targets", () => {
    expect(parseWrapperArgs([]).sub).toBe("help");
    expect(() => parseWrapperArgs(["app"])).toThrow(/Docker/);
  });

  it("refuses --switch-vercel on dry runs and rehearsals", () => {
    expect(() => parseWrapperArgs(["db", "--to", "N_URL", "--dry-run", "--switch-vercel"])).toThrow(/real move/);
    expect(() => parseWrapperArgs(["db", "--to", "N_URL", "--no-freeze", "--switch-vercel"])).toThrow(/real move/);
    expect(() => parseWrapperArgs(["db", "--unfreeze", "--switch-vercel"])).toThrow(/real move/);
  });
});
