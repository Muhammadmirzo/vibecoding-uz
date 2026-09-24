import {
  sendOtpSmsSchema,
  sendSmsSchema,
  type SendOtpSmsInput,
  type SendSmsInput,
} from "@/lib/validations/sms";
import { normalizePhoneForEskiz, redactPhone } from "./redaction";
import { fetchWithRetry } from "./request";
import { clearEskizTokenCache, getEskizToken } from "./token";

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  mock?: boolean;
  error?: string;
}

/** Sends a generic SMS message via Eskiz.uz or mock fallback. */
export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const validated = sendSmsSchema.parse(input);
  const formattedPhone = normalizePhoneForEskiz(validated.phone);
  const from = validated.from || process.env.ESKIZ_FROM || "4546";
  let token = await getEskizToken();

  if (!token) {
    const redactedPhone = redactPhone(formattedPhone);
    const logMessage = process.env.NODE_ENV === "production"
      ? "[REDACTED]"
      : validated.message;
    console.warn(`[SMS Mock] To: ${redactedPhone} | From: ${from} | Text: "${logMessage}"`);
    return {
      success: true,
      messageId: `mock-sms-${Date.now()}`,
      mock: true,
    };
  }

  const sendRequest = async (authToken: string): Promise<Response> => {
    const formData = new URLSearchParams();
    formData.append("mobile_phone", formattedPhone);
    formData.append("message", validated.message);
    formData.append("from", from);
    return await fetchWithRetry(
      "https://notify.eskiz.uz/api/message/sms/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      },
      2,
      8000
    );
  };

  try {
    let response = await sendRequest(token);
    if (response.status === 401) {
      clearEskizTokenCache();
      const freshToken = await getEskizToken();
      if (freshToken) {
        token = freshToken;
        response = await sendRequest(token);
      }
    }

    const data = (await response.json().catch(() => ({}))) as {
      id?: string | number;
      message?: string;
      status?: string;
    };

    if (response.ok && data?.id) {
      return { success: true, messageId: String(data.id) };
    }
    return {
      success: false,
      error: data?.message || `Eskiz API returned error status: ${response.status}`,
    };
  } catch (error) {
    console.error("Eskiz send SMS failed:", error);
    return { success: false, error: String(error) };
  }
}

/** Sends an OTP verification code via SMS. */
export async function sendOtpSms(input: SendOtpSmsInput): Promise<SendSmsResult> {
  const validated = sendOtpSmsSchema.parse(input);
  const message = `Naqsh — Tasdiqlash kodingiz: ${validated.code}. Kodni hech kimga bermang!`;
  return sendSms({ phone: validated.phone, message });
}
