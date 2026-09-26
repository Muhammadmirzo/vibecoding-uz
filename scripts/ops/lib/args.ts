/**
 * Argument parsing for the ops scripts. Connection strings are NEVER accepted on the command line
 * (they would land in shell history and `ps`): flags take the NAME of an env var that holds the URL.
 */

export class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}

const ENV_NAME = /^[A-Z][A-Z0-9_]{1,63}$/;

/** Validates an env var NAME; refuses anything that looks like a literal URL or password. */
export function envName(flag: string, value: string | undefined): string {
  if (!value) throw new UsageError(`${flag} needs an env var name, e.g. ${flag} NEW_DATABASE_URL`);
  if (/[:/@]/.test(value)) {
    throw new UsageError(
      `${flag}: pass the NAME of an env var, not the URL itself (it would stay in shell history). ` +
        `/ URL o'rniga env o'zgaruvchi NOMINI bering, masalan: export NEW_DATABASE_URL=... ; ${flag} NEW_DATABASE_URL`,
    );
  }
  if (!ENV_NAME.test(value)) throw new UsageError(`${flag}: "${value}" is not a valid env var name (A-Z, 0-9, _)`);
  return value;
}

type FlagKind = "bool" | "env" | "path";
type Spec = Record<string, FlagKind>;
type Parsed<S extends Spec> = { [K in keyof S]?: S[K] extends "bool" ? boolean : string };

/** Tiny strict flag parser: unknown flags and stray words are errors (a typo must not run a move). */
export function parseFlags<S extends Spec>(argv: readonly string[], spec: S): Parsed<S> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith("--")) throw new UsageError(`unexpected argument "${raw.includes("://") ? "(hidden URL)" : raw}"`);
    const [name, inline] = raw.slice(2).split(/=(.*)/s, 2);
    const kind = spec[name];
    if (!kind) throw new UsageError(`unknown flag --${name}`);
    if (kind === "bool") {
      if (inline !== undefined) throw new UsageError(`--${name} takes no value`);
      out[name] = true;
      continue;
    }
    const value = inline ?? argv[++i];
    if (value === undefined || value.startsWith("--")) throw new UsageError(`--${name} needs a value`);
    out[name] = kind === "env" ? envName(`--${name}`, value) : value;
  }
  return out as Parsed<S>;
}

export interface MoveArgs {
  to?: string;
  from?: string;
  dryRun: boolean;
  yes: boolean;
  freeze: boolean;
  unfreeze: boolean;
  keepDump?: string;
}

const MOVE_SPEC = {
  to: "env", from: "env", "dry-run": "bool", yes: "bool", "no-freeze": "bool", unfreeze: "bool",
  "keep-dump": "path", "allow-nonempty": "bool",
} as const;

export function parseMoveArgs(argv: readonly string[]): MoveArgs {
  const f = parseFlags(argv, MOVE_SPEC);
  if (f["allow-nonempty"]) {
    throw new UsageError(
      "--allow-nonempty is refused: restoring over existing tables can silently mix or lose data. " +
        "Use a fresh, empty database. / Bo'sh (yangi) baza bering.",
    );
  }
  if (f.unfreeze) {
    if (f.to || f["dry-run"] || f["no-freeze"] || f["keep-dump"]) throw new UsageError("--unfreeze runs alone (plus --from/--yes)");
  } else if (!f.to) {
    throw new UsageError("--to <ENV_NAME> is required (the env var that holds the NEW database URL)");
  }
  if (f.to && f.from && f.to === f.from) throw new UsageError("--to and --from point to the same env var");
  return {
    to: f.to,
    from: f.from,
    dryRun: f["dry-run"] === true,
    yes: f.yes === true,
    freeze: f["no-freeze"] !== true,
    unfreeze: f.unfreeze === true,
    keepDump: f["keep-dump"],
  };
}
