import { describe, expect, it, beforeEach } from "vitest";
import {
  MOBILE_TOKEN_AUDIENCE,
  parseBearerToken,
  signAccessToken,
  verifyAccessToken,
} from "@/lib/auth/mobile-access";

beforeEach(() => {
  process.env.API_JWT_SECRET = "w9-test-secret-please-change-in-prod-123456";
});

describe("mobile access tokens", () => {
  it("round-trips sub/role/sid with the mobile audience", async () => {
    const token = await signAccessToken({ userId: "user-1", role: "student", sessionId: "sess-1" });
    const result = await verifyAccessToken(token);
    expect("payload" in result && result.payload.sub).toBe("user-1");
    expect("payload" in result && result.payload.role).toBe("student");
    expect("payload" in result && result.payload.aud).toBe(MOBILE_TOKEN_AUDIENCE);
  });

  it("rejects forged tokens", async () => {
    const token = await signAccessToken({ userId: "user-1", role: "student", sessionId: "sess-1" });
    const forged = `${token.slice(0, -1)}${token.endsWith("0") ? "1" : "0"}`;
    expect(await verifyAccessToken(forged)).toEqual({ error: "BAD_SIGNATURE" });
  });

  it("rejects expired tokens and garbage", async () => {
    const { createHmac } = await import("node:crypto");
    expect(await verifyAccessToken(null)).toEqual({ error: "MISSING" });
    expect(await verifyAccessToken("not-a-token")).toEqual({ error: "BAD_SHAPE" });
    const secret = process.env.API_JWT_SECRET as string;
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(JSON.stringify({
      sub: "u", role: "student", sid: "s", aud: MOBILE_TOKEN_AUDIENCE,
      iat: Math.floor(Date.now() / 1000) - 3600, exp: Math.floor(Date.now() / 1000) - 60,
    })).toString("base64url");
    const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("hex");
    expect(await verifyAccessToken(`${header}.${body}.${sig}`)).toEqual({ error: "EXPIRED" });
  });

  it("parses only well-formed Bearer headers", () => {
    expect(parseBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(parseBearerToken("bearer abc")).toBeNull();
    expect(parseBearerToken("Token abc")).toBeNull();
    expect(parseBearerToken(null)).toBeNull();
  });
});
