export class ExternalRequestError extends Error {
  constructor(
    public provider: string,
    public retryable: boolean,
    message: string,
  ) {
    super(message);
    this.name = "ExternalRequestError";
  }
}

/** Fetch wrapper shared by external providers; every call has a hard wall-clock deadline. */
export async function fetchWithTimeout(
  provider: string,
  input: string | URL | Request,
  init: RequestInit = {},
  timeoutMs = 8_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = init.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal;
  try {
    return await fetch(input, { ...init, signal });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? `${provider} javobi kutilgan vaqtdan kechikdi`
      : `${provider} bilan bog'lanib bo'lmadi`;
    throw new ExternalRequestError(provider, true, message);
  } finally {
    clearTimeout(timer);
  }
}

export function isRetryableHttpStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}
