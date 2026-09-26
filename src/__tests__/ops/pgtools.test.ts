import { statSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { dumpArgs, filterToc, parseToolMajor, restoreArgs } from "../../../scripts/ops/lib/pgtools";
import { ageEncryptArgs, parseAgeRecipients, Scratch } from "../../../scripts/ops/lib/tempdir";
import { freezeSql, unfreezeSql, SECURITY_BASELINE_SQL } from "../../../scripts/ops/lib/ops-sql";
import { backupStamp } from "../../../scripts/ops/backup-db";

describe("pg tool helpers", () => {
  it("parses tool versions", () => {
    expect(parseToolMajor("pg_dump (PostgreSQL) 17.6 (Ubuntu 17.6-1.pgdg24.04+1)")).toBe(17);
    expect(parseToolMajor("pg_restore (PostgreSQL) 16.4")).toBe(16);
    expect(parseToolMajor("garbage")).toBeNull();
  });
  it("comments out the public schema entry and its comment only", () => {
    const toc = [
      "; Archive created at 2026-09-26",
      "5; 2615 2200 SCHEMA - public pg_database_owner",
      "6; 0 0 COMMENT - SCHEMA public pg_database_owner",
      "7; 2615 16390 SCHEMA - drizzle postgres",
      "220; 1259 16400 TABLE public users postgres",
    ].join("\n");
    expect(filterToc(toc).split("\n")).toEqual([
      "; Archive created at 2026-09-26",
      ";5; 2615 2200 SCHEMA - public pg_database_owner",
      ";6; 0 0 COMMENT - SCHEMA public pg_database_owner",
      "7; 2615 16390 SCHEMA - drizzle postgres",
      "220; 1259 16400 TABLE public users postgres",
    ]);
  });
  it("dump args: custom format, our schemas, snapshot, no owner/privileges, no connection info", () => {
    const a = dumpArgs("/tmp/x.dump", "00000003-0000001B-1", ["public", "drizzle"]);
    expect(a).toEqual(expect.arrayContaining([
      "--format=custom", "--no-owner", "--no-privileges", "--schema=public", "--schema=drizzle",
      "--snapshot=00000003-0000001B-1", "--file=/tmp/x.dump",
    ]));
    expect(a.join(" ")).not.toMatch(/postgres(ql)?:\/\/|--host|--password/);
  });
  it("restore args: all-or-nothing", () => {
    expect(restoreArgs("/tmp/x.dump", "/tmp/l", "postgres")).toEqual(expect.arrayContaining([
      "--single-transaction", "--exit-on-error", "--no-owner", "--no-privileges", "--use-list=/tmp/l", "--dbname=postgres",
    ]));
  });
});

describe("scratch dir and encryption helpers", () => {
  it("creates a 0700 dir with 0600 files and removes everything on close, running hooks first", async () => {
    const s = new Scratch("naqsh-test-");
    const f = s.writePrivate("secret.txt", "x");
    expect(statSync(s.dir).mode & 0o777).toBe(0o700);
    expect(statSync(f).mode & 0o777).toBe(0o600);
    const order: string[] = [];
    s.onClose(() => { order.push("first"); });
    s.onClose(() => { order.push("second"); });
    await s.close();
    expect(order).toEqual(["second", "first"]);
    expect(existsSync(s.dir)).toBe(false);
  });
  it("accepts only age public keys as recipients", () => {
    const key = "age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p";
    expect(parseAgeRecipients(` ${key},${key}\n`)).toEqual([key, key]);
    expect(parseAgeRecipients(undefined)).toEqual([]);
    expect(() => parseAgeRecipients("AGE-SECRET-KEY-1ABC")).toThrow(/public keys/);
    expect(ageEncryptArgs([key], "in", "out")).toEqual(["-r", key, "-o", "out", "in"]);
  });
  it("backup file stamps sort chronologically", () => {
    expect(backupStamp(new Date("2026-09-26T19:17:05.123Z"))).toBe("20260926T191705Z");
  });
});

describe("maintenance + baseline SQL", () => {
  it("freezes/unfreezes only the current role in the source database; unfreeze leaves read-only first", () => {
    expect(freezeSql("postgres")).toBe('ALTER ROLE CURRENT_USER IN DATABASE "postgres" SET default_transaction_read_only = on');
    expect(freezeSql('we"ird')).toContain('IN DATABASE "we""ird"');
    const [first, second] = unfreezeSql("postgres");
    expect(first).toBe("SET default_transaction_read_only = off");
    expect(second).toBe('ALTER ROLE CURRENT_USER IN DATABASE "postgres" RESET default_transaction_read_only');
  });
  it("baseline revokes API roles only if they exist and enables RLS", () => {
    expect(SECURITY_BASELINE_SQL).toMatch(/IF EXISTS \(SELECT 1 FROM pg_roles WHERE rolname = api_role\)/);
    expect(SECURITY_BASELINE_SQL).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(SECURITY_BASELINE_SQL).toMatch(/ARRAY\['anon', 'authenticated'\]/);
  });
});
