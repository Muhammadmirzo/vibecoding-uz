/**
 * A private scratch dir (0700, files 0600) that is ALWAYS removed: on success, on error and on
 * Ctrl-C / SIGTERM. Plain-text dumps and pgpass files live only here.
 */
import { mkdtempSync, rmSync, writeFileSync, chmodSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ConnInfo } from "./conn";
import { pgpassLine } from "./conn";

type Cleanup = () => void | Promise<void>;

export class Scratch {
  readonly dir: string;
  private cleanups: Cleanup[] = [];
  private done = false;

  constructor(prefix = "naqsh-ops-") {
    this.dir = mkdtempSync(path.join(os.tmpdir(), prefix));
    chmodSync(this.dir, 0o700);
    const onSignal = (signal: NodeJS.Signals) => {
      console.error(`\n${signal} received, cleaning up… / to'xtatildi, tozalanmoqda…`);
      void this.close().finally(() => process.exit(130));
    };
    process.once("SIGINT", onSignal);
    process.once("SIGTERM", onSignal);
    process.once("exit", () => this.removeDirSync());
  }

  file(name: string): string {
    return path.join(this.dir, name);
  }

  /** Writes a 0600 file (mode applied at creation, so it is never world-readable). */
  writePrivate(name: string, content: string): string {
    const file = this.file(name);
    writeFileSync(file, content, { mode: 0o600 });
    return file;
  }

  /** A PGPASSFILE for the given connections. */
  pgpass(name: string, conns: ConnInfo[]): string {
    return this.writePrivate(name, conns.map(pgpassLine).join("\n") + "\n");
  }

  /** Registered hooks run LIFO before the directory is removed (e.g. unfreeze the source on failure). */
  onClose(fn: Cleanup): void {
    this.cleanups.push(fn);
  }

  async close(): Promise<void> {
    if (this.done) return;
    this.done = true;
    for (const fn of this.cleanups.reverse()) {
      try {
        await fn();
      } catch (e) {
        console.error(`cleanup step failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    this.removeDirSync();
  }

  private removeDirSync(): void {
    rmSync(this.dir, { recursive: true, force: true });
  }
}

/** age recipients from an env var (space/comma/newline separated public keys `age1…`). */
export function parseAgeRecipients(value: string | undefined): string[] {
  const list = (value ?? "").split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  for (const r of list) {
    if (!/^age1[0-9a-z]{58}$/.test(r)) {
      throw new Error("BACKUP_AGE_RECIPIENTS must contain only age public keys (age1…); never a secret key");
    }
  }
  return list;
}

export function ageEncryptArgs(recipients: string[], input: string, output: string): string[] {
  return [...recipients.flatMap((r) => ["-r", r]), "-o", output, input];
}
