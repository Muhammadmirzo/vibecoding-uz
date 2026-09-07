import { sendSmsSchema, sendOtpSmsSchema, SendSmsInput, SendOtpSmsInput } from "@/lib/validations/sms";

interface EskizTokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: EskizTokenCache | null = null;

export function clearEskizTokenCache(): void {
  tokenCache = null;
}

/**
 * Redacts phone numbers for safe logging (+99890***567)
 */
export function redactPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length >= 9) {
    const fullDigits = digits.startsWith("998") ? digits : `998${digits}`;
    return `+${fullDigits.slice(0, 5)}***${fullDigits.slice(-3)}`;
  }
  return "***";
}

/**
 * Formats Uzbek phone numbers into Eskiz format: 998XXXXXXXXX (digits only, 12 chars)
 */
export function normalizePhoneForEskiz(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, "");
  if (cleaned.startsWith("8") && cleaned.length === 10) {
    cleaned = "998" + cleaned.slice(1);
  } else if (cleaned.length === 9) {
    cleaned = "998" + cleaned;
  }
  return cleaned;
}

/**
 * Helper to fetch external API with exponential retry backoff & request timeout
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  timeoutMs = 5000
): Promise<Response> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Retry on transient 5xx server errors
      if (res.status >= 500 && attempt < maxRetries) {
        const backoff = 150 * Math.pow(2, attempt) + Math.random() * 50;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt === maxRetries) throw err;

      const backoff = 150 * Math.pow(2, attempt) + Math.random() * 50;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastError;
}

/**
 * Authenticates with Eskiz.uz API and retrieves / caches Bearer token.
 */
export async function getEskizToken(): Promise<string | null> {
  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;

  if (!email || !password) {
    return null;
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  try {
    const res = await fetchWithRetry("https://notify.eskiz.uz/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }, 2, 5000);

    if (!res.ok) {
      console.error("Eskiz auth request failed with status", res.status);
      return null;
    }

    const data = (await res.json()) as { data?: { token?: string }; message?: string };
    if (data?.data?.token) {
      tokenCache = {
        token: data.data.token,
        expiresAt: now + 29 * 24 * 60 * 60 * 1000,
      };
      return tokenCache.token;
    }
  } catch (err) {
    console.error("Failed to authenticate with Eskiz API:", err);
  }

  return null;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  mock?: boolean;
  error?: string;
}

/**
 * Sends a generic SMS message via Eskiz.uz API or mock fallback.
 */
export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const validated = sendSmsSchema.parse(input);
  const formattedPhone = normalizePhoneForEskiz(validated.phone);
  const from = validated.from || process.env.ESKIZ_FROM || "4546";

  let token = await getEskizToken();

  if (!token) {
    const redactedPhone = redactPhone(formattedPhone);
    const logMessage = process.env.NODE_ENV === "production" ? "[REDACTED]" : validated.message;
    console.warn(`[SMS Mock] To: ${redactedPhone} | From: ${from} | Text: "${logMessage}"`);
    return {
      success: true,
      messageId: `mock-sms-${Date.now()}`,
      mock: true,
    };
  }

  const sendRequest = async (authToken: string) => {
    const formData = new URLSearchParams();
    formData.append("mobile_phone", formattedPhone);
    formData.append("message", validated.message);
    formData.append("from", from);

    return await fetchWithRetry("https://notify.eskiz.uz/api/message/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    }, 2, 8000);
  };

  try {
    let res = await sendRequest(token);

    // If token expired (401 Unauthorized), invalidate tokenCache and retry once with a fresh token
    if (res.status === 401) {
      clearEskizTokenCache();
      const freshToken = await getEskizToken();
      if (freshToken) {
        token = freshToken;
        res = await sendRequest(token);
      }
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string | number; message?: string; status?: string };

    if (res.ok && data?.id) {
      return {
        success: true,
        messageId: String(data.id),
      };
    }

    return {
      success: false,
      error: data?.message || `Eskiz API returned error status: ${res.status}`,
    };
  } catch (err) {
    console.error("Eskiz send SMS failed:", err);
    return {
      success: false,
      error: String(err),
    };
  }
}

/**
 * Helper to send OTP verification code via SMS.
 */
export async function sendOtpSms(input: SendOtpSmsInput): Promise<SendSmsResult> {
  const validated = sendOtpSmsSchema.parse(input);
  const message = `Vibecoding.uz — Tasdiqlash kodingiz: ${validated.code}. Kodni hech kimga bermang!`;
  return sendSms({
    phone: validated.phone,
    message,
  });
}

