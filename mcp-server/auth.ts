/**
 * MCP server auth: fail-closed bearer token via MCP_AUTH_TOKEN.
 * - The server refuses to start without the env var (see requireServerToken).
 * - Each tool call carries an optional `authToken` arg, compared with
 *   crypto.timingSafeEqual. Wrong/missing token -> structured auth error.
 * - Tokens are never logged.
 */
import { timingSafeEqual } from "node:crypto";

export const MCP_AUTH_ENV_VAR = "MCP_AUTH_TOKEN";

export function getExpectedToken(): string | undefined {
  const value = process.env[MCP_AUTH_ENV_VAR];
  return value !== undefined && value.length > 0 ? value : undefined;
}

/** Throws when MCP_AUTH_TOKEN is missing so the server exits non-zero. */
export function requireServerToken(): string {
  const token = getExpectedToken();
  if (token === undefined) {
    throw new Error(
      `[mcp-server] ${MCP_AUTH_ENV_VAR} env var is required. Refusing to start without an auth token.`
    );
  }
  return token;
}

/** Constant-time comparison of the caller token against the env var. */
export function verifyAuthToken(provided: string | undefined): boolean {
  const expected = getExpectedToken();
  if (expected === undefined || provided === undefined) return false;
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
