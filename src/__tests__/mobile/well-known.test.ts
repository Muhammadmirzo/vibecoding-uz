import { describe, expect, it, afterEach } from "vitest";
import { GET as apple } from "@/app/.well-known/apple-app-site-association/route";
import { GET as assetlinks } from "@/app/.well-known/assetlinks.json/route";

const ENV_KEYS = ["IOS_TEAM_ID", "IOS_BUNDLE_ID", "ANDROID_PACKAGE", "ANDROID_SHA256"];

function snapshotEnv(): Record<string, string | undefined> {
  const snap: Record<string, string | undefined> = {};
  for (const key of ENV_KEYS) snap[key] = process.env[key];
  return snap;
}

function restoreEnv(snap: Record<string, string | undefined>): void {
  for (const key of ENV_KEYS) {
    if (snap[key] === undefined) delete process.env[key];
    else process.env[key] = snap[key];
  }
}

describe("well-known association files", () => {
  const snap = snapshotEnv();
  afterEach(() => restoreEnv(snap));

  it("is empty-safe when env is missing", async () => {
    for (const key of ENV_KEYS) delete process.env[key];
    const a = await apple();
    expect(a.headers.get("Content-Type")).toContain("application/json");
    const aBody = (await a.json()) as { applinks: { details: unknown[] } };
    expect(aBody.applinks.details).toEqual([]);
    const g = await assetlinks();
    expect(g.headers.get("Content-Type")).toContain("application/json");
    expect(await g.json()).toEqual([]);
  });

  it("generates team-scoped entries from env", async () => {
    process.env.IOS_TEAM_ID = "ABCDE12345";
    process.env.IOS_BUNDLE_ID = "uz.naqsh.app";
    process.env.ANDROID_PACKAGE = "uz.naqsh.app";
    process.env.ANDROID_SHA256 = "AA:BB:CC:DD";
    const aBody = (await (await apple()).json()) as {
      applinks: { details: { appID: string; paths: string[] }[] };
    };
    expect(aBody.applinks.details[0]?.appID).toBe("ABCDE12345.uz.naqsh.app");
    expect(aBody.applinks.details[0]?.paths).toEqual(["/kurs/*", "/kabinet*", "/ref/*"]);
    const gBody = (await (await assetlinks()).json()) as {
      target: { package_name: string; sha256_cert_fingerprints: string[] };
    }[];
    expect(gBody[0]?.target.package_name).toBe("uz.naqsh.app");
    expect(gBody[0]?.target.sha256_cert_fingerprints).toEqual(["AA:BB:CC:DD"]);
  });
});
