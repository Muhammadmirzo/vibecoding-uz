/** Fetches an external API with exponential retry backoff and timeout. */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  timeoutMs = 5000
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.status >= 500 && attempt < maxRetries) {
        const backoff = 150 * Math.pow(2, attempt) + Math.random() * 50;
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt === maxRetries) throw error;

      const backoff = 150 * Math.pow(2, attempt) + Math.random() * 50;
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  throw lastError;
}
