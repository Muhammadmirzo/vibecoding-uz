import { afterEach, describe, expect, it } from "vitest";
import {
  getExpectedToken,
  MCP_AUTH_ENV_VAR,
  requireServerToken,
  verifyAuthToken,
} from "../../../mcp-server/auth";
import { extractAuthToken } from "../../../mcp-server/types";

const ORIGINAL = process.env[MCP_AUTH_ENV_VAR];

afterEach(() => {
  if (ORIGINAL === undefined) {
    delete process.env[MCP_AUTH_ENV_VAR];
  } else {
    process.env[MCP_AUTH_ENV_VAR] = ORIGINAL;
  }
});

describe("mcp auth", () => {
  it("refuses to start without MCP_AUTH_TOKEN", () => {
    delete process.env[MCP_AUTH_ENV_VAR];
    expect(getExpectedToken()).toBeUndefined();
    expect(() => requireServerToken()).toThrow(/MCP_AUTH_TOKEN/);
  });

  it("accepts the exact token with constant-time comparison", () => {
    process.env[MCP_AUTH_ENV_VAR] = "secret-token-123";
    expect(requireServerToken()).toBe("secret-token-123");
    expect(verifyAuthToken("secret-token-123")).toBe(true);
  });

  it("rejects wrong, missing, and length-mismatched tokens", () => {
    process.env[MCP_AUTH_ENV_VAR] = "secret-token-123";
    expect(verifyAuthToken("wrong-token-1234")).toBe(false);
    expect(verifyAuthToken("short")).toBe(false);
    expect(verifyAuthToken(undefined)).toBe(false);
  });

  it("fails closed when the server token is not configured", () => {
    delete process.env[MCP_AUTH_ENV_VAR];
    expect(verifyAuthToken("anything")).toBe(false);
  });

  it("extracts authToken only from well-formed args", () => {
    expect(extractAuthToken({ authToken: "abc" })).toBe("abc");
    expect(extractAuthToken({})).toBeUndefined();
    expect(extractAuthToken({ authToken: 42 })).toBeUndefined();
    expect(extractAuthToken({ authToken: "" })).toBeUndefined();
    expect(extractAuthToken(null)).toBeUndefined();
    expect(extractAuthToken("token")).toBeUndefined();
  });
});
