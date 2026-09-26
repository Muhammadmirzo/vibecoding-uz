import { describe, expect, it } from "vitest";
import {
  assertNotTransactionPooler, libpqEnv, parseConnUrl, pgpassLine, postgresJsOptions, sameDatabase, toSessionConnection,
} from "../../../scripts/ops/lib/conn";
import { maskUrl, redact, secretsOf } from "../../../scripts/ops/lib/mask";

const POOLER = "postgresql://postgres.abcdefghijklmnopqrst:Pa%3Ass@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres"; // lessons-ignore: test dummy

describe("TLS policy", () => {
  it("defaults remote hosts to sslmode=require", () => {
    expect(parseConnUrl("postgres://u:p@db.example.com/app", "T").sslmode).toBe("require");
  });
  it("keeps verify-full and refuses weak modes on remote hosts", () => {
    expect(parseConnUrl("postgres://u:p@h.example.com/db?sslmode=verify-full", "T").sslmode).toBe("verify-full");
    for (const mode of ["disable", "allow", "prefer"]) {
      expect(() => parseConnUrl(`postgres://u:p@h.example.com/db?sslmode=${mode}`, "T")).toThrow(/refused/);
    }
  });
  it("allows plain connections only on loopback", () => {
    expect(parseConnUrl("postgres://u:p@127.0.0.1:55432/postgres", "T").sslmode).toBe("disable");
    expect(parseConnUrl("postgres://u:p@localhost/db?sslmode=disable", "T").sslmode).toBe("disable");
  });
  it("rejects non-postgres URLs without echoing them", () => {
    expect(() => parseConnUrl("mysql://u:hunter22@h/db", "T")).toThrow(/postgres/);
    expect(() => parseConnUrl("not a url hunter22", "T")).toThrow(/^(?!.*hunter22)/);
  });
});

describe("pooler handling", () => {
  it("switches the Supabase transaction pooler to the session port", () => {
    const { info, switched } = toSessionConnection(parseConnUrl(POOLER, "S"));
    expect(switched).toBe(true);
    expect(info.port).toBe(5432);
    expect(info.password).toBe("Pa:ss");
    expect(() => assertNotTransactionPooler(info, "S")).not.toThrow();
  });
  it("refuses 6543 on other hosts", () => {
    const info = toSessionConnection(parseConnUrl("postgres://u:p@pgbouncer.example.com:6543/db", "S")).info;
    expect(() => assertNotTransactionPooler(info, "S")).toThrow(/6543/);
  });
});

describe("same-database guard", () => {
  it("matches Supabase refs across pooler and direct hosts", () => {
    const pooler = parseConnUrl(POOLER, "A");
    const direct = parseConnUrl("postgres://postgres:x@db.abcdefghijklmnopqrst.supabase.co:5432/postgres", "B");
    expect(sameDatabase(pooler, direct)).toBe(true);
    const other = parseConnUrl("postgres://postgres.zyxwvutsrqponmlkjihg:x@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres", "C");
    expect(sameDatabase(pooler, other)).toBe(false);
  });
  it("falls back to host:port/db", () => {
    const a = parseConnUrl("postgres://u:p@h.example.com:5432/app", "A");
    expect(sameDatabase(a, parseConnUrl("postgres://v:q@H.example.com:5432/app", "B"))).toBe(true);
    expect(sameDatabase(a, parseConnUrl("postgres://u:p@h.example.com:5432/other", "B"))).toBe(false);
  });
});

describe("secrets never in argv or logs", () => {
  it("escapes pgpass fields and keeps the password out of libpq env", () => {
    const info = parseConnUrl("postgres://us%3Aer:p%5Cw%3Ad@h.example.com:5432/db", "T"); // lessons-ignore: test dummy
    expect(pgpassLine(info)).toBe("h.example.com:5432:db:us\\:er:p\\\\w\\:d");
    const env = libpqEnv(info, "/tmp/x/pgpass");
    expect(JSON.stringify(env)).not.toContain("p\\w:d");
    expect(env).toMatchObject({ PGSSLMODE: "require", PGPASSFILE: "/tmp/x/pgpass" });
  });
  it("postgres-js options: prepare off, TLS kept", () => {
    const o = postgresJsOptions(parseConnUrl("postgres://u:p@h.example.com/db?sslmode=verify-ca", "T"));
    expect(o.prepare).toBe(false);
    expect(o.ssl).toBe("verify-full");
  });
  it("masks URLs and redacts passwords (plain and URL-encoded)", () => {
    expect(maskUrl(POOLER)).toBe("postgresql://postgres.abcdefghijklmnopqrst:***@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres");
    expect(maskUrl(undefined)).toBe("(unset)");
    expect(maskUrl("garbage secret")).not.toContain("secret");
    const text = `failed for ${POOLER} with password Pa:ss (Pa%3Ass)`;
    const out = redact(text, secretsOf(POOLER));
    expect(out).not.toContain("Pa:ss");
    expect(out).not.toContain("Pa%3Ass");
    expect(redact("postgres://a:zz9@x/y", [])).toBe("postgres://a:***@x/y");
  });
});
