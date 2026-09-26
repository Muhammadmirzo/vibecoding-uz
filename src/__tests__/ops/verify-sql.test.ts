import { describe, expect, it } from "vitest";
import {
  checksumSql, compareManifests, quoteIdent, sortTables, totalRows, type Manifest,
} from "../../../scripts/ops/lib/verify-sql";

const manifest = (over: Partial<Manifest> = {}): Manifest => ({
  version: 1,
  createdAt: "2026-09-26T00:00:00.000Z",
  serverMajor: 17,
  tables: [
    { name: "drizzle.__drizzle_migrations", rows: 14, sum: "a".repeat(32), rls: false },
    { name: "public.users", rows: 5, sum: "b".repeat(32), rls: true },
  ],
  sequences: [{ name: "drizzle.__drizzle_migrations_id_seq", value: "14" }],
  ...over,
});

describe("checksum SQL builder", () => {
  it("orders by primary key columns with byte collation", () => {
    const q = checksumSql({ schema: "public", table: "users", pk: ["id"] });
    expect(q).toContain(`ORDER BY _naqsh_row."id"::text COLLATE "C"`);
    expect(q).toContain(`FROM "public"."users" AS _naqsh_row`);
    expect(q).toContain("count(*)::bigint");
    expect(q).toContain("md5(COALESCE(string_agg(md5(_naqsh_row::text), ''");
  });
  it("keeps composite PK order", () => {
    expect(checksumSql({ schema: "public", table: "t", pk: ["b", "a"] }))
      .toContain(`ORDER BY _naqsh_row."b"::text COLLATE "C", _naqsh_row."a"::text COLLATE "C"`);
  });
  it("orders by the whole row when a table has no PK (lesson_progress)", () => {
    expect(checksumSql({ schema: "public", table: "lesson_progress", pk: [] }))
      .toContain(`ORDER BY _naqsh_row::text COLLATE "C"`);
  });
  it("quotes identifiers safely", () => {
    expect(quoteIdent('we"ird')).toBe('"we""ird"');
    expect(checksumSql({ schema: "public", table: 'x"; drop table y; --', pk: [] })).toContain('"x""; drop table y; --"');
  });
});

describe("table ordering", () => {
  it("sorts by schema then table in byte order, not locale", () => {
    const sorted = sortTables([
      { schema: "public", table: "users" }, { schema: "drizzle", table: "__drizzle_migrations" },
      { schema: "public", table: "Zeta" }, { schema: "public", table: "api_refresh_tokens" },
    ]);
    expect(sorted.map((t) => `${t.schema}.${t.table}`)).toEqual([
      "drizzle.__drizzle_migrations", "public.Zeta", "public.api_refresh_tokens", "public.users",
    ]);
  });
});

describe("manifest comparison", () => {
  it("identical manifests have no differences", () => {
    expect(compareManifests(manifest(), manifest())).toEqual([]);
    expect(totalRows(manifest())).toBe(19);
  });
  it("reports row count and checksum differences separately", () => {
    const rows = manifest({ tables: [manifest().tables[0], { ...manifest().tables[1], rows: 4 }] });
    expect(compareManifests(manifest(), rows)).toEqual(["public.users: rows 5 → 4"]);
    const data = manifest({ tables: [manifest().tables[0], { ...manifest().tables[1], sum: "c".repeat(32) }] });
    expect(compareManifests(manifest(), data)[0]).toMatch(/checksum differs/);
  });
  it("reports missing/extra tables, RLS off and sequence drift", () => {
    const target = manifest({
      tables: [manifest().tables[0], { ...manifest().tables[1], rls: false }, { name: "public.extra", rows: 0, sum: "", rls: true }],
      sequences: [{ name: "drizzle.__drizzle_migrations_id_seq", value: "13" }],
    });
    const diffs = compareManifests(manifest(), target);
    expect(diffs).toContain("public.users: RLS is off on target");
    expect(diffs).toContain("public.extra: extra table on target");
    expect(diffs.some((d) => d.startsWith("sequence drizzle.__drizzle_migrations_id_seq"))).toBe(true);
  });
  it("demands the migration journal on both sides", () => {
    const noJournal = manifest({ tables: [manifest().tables[1]] });
    expect(compareManifests(noJournal, noJournal)).toEqual([
      "drizzle.__drizzle_migrations: missing on source (migration journal)",
      "drizzle.__drizzle_migrations: missing on target (migration journal)",
    ]);
  });
});
