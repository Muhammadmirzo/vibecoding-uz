function createDevelopmentSecret(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function resolveSessionSecret(): string {
  const configuredSecret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET or NEXTAUTH_SECRET must be configured in production"
    );
  }

  const developmentSecret = createDevelopmentSecret();
  console.warn(
    "[auth] No SESSION_SECRET or NEXTAUTH_SECRET configured; generated an " +
      "ephemeral development secret. All session tokens will be invalid after restart."
  );
  return developmentSecret;
}

export const SESSION_SECRET = resolveSessionSecret();

export function getSessionSecret(): string {
  return SESSION_SECRET;
}
