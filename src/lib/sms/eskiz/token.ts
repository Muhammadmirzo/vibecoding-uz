import { fetchWithRetry } from "./request";

interface EskizTokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: EskizTokenCache | null = null;

export function clearEskizTokenCache(): void {
  tokenCache = null;
}

/** Authenticates with Eskiz.uz and retrieves or caches a Bearer token. */
export async function getEskizToken(): Promise<string | null> {
  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;
  if (!email || !password) return null;

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) return tokenCache.token;

  try {
    const response = await fetchWithRetry(
      "https://notify.eskiz.uz/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
      2,
      5000
    );

    if (!response.ok) {
      console.error("Eskiz auth request failed with status", response.status);
      return null;
    }

    const data = (await response.json()) as {
      data?: { token?: string };
      message?: string;
    };
    if (data?.data?.token) {
      tokenCache = {
        token: data.data.token,
        expiresAt: now + 29 * 24 * 60 * 60 * 1000,
      };
      return tokenCache.token;
    }
  } catch (error) {
    console.error("Failed to authenticate with Eskiz API:", error);
  }

  return null;
}
