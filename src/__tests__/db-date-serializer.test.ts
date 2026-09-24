import { describe, expect, it } from "vitest";
import { serializeDateParam } from "@/db";

describe("db date param serializer", () => {
  it("turns raw Date params into ISO strings (postgres-js cannot write Date objects)", () => {
    expect(serializeDateParam(new Date("2026-09-24T10:00:00.000Z"))).toBe("2026-09-24T10:00:00.000Z");
  });
  it("passes strings through untouched (typed columns already convert)", () => {
    expect(serializeDateParam("2026-09-24 10:00:00+00")).toBe("2026-09-24 10:00:00+00");
  });
});
