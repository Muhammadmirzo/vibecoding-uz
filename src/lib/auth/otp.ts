import crypto from "crypto";

export const MAX_OTP_ATTEMPTS = 3;
export const DEFAULT_OTP_TTL_MINUTES = 5;

export interface OtpRecord {
  id: string;
  phone: string;
  codeHash: string;
  purpose: string;
  attempts: number;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export type OtpVerificationError =
  | "EXPIRED"
  | "MAX_ATTEMPTS_EXCEEDED"
  | "ALREADY_USED"
  | "INVALID_CODE";

export interface OtpVerificationResult {
  valid: boolean;
  error?: OtpVerificationError;
  updatedRecord: OtpRecord;
}

export function hashOtpCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function generateOtpCode(length = 6): string {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    code += digits[randomIndex];
  }
  return code;
}

export function createOtpRecord(params: {
  id?: string;
  phone: string;
  purpose: string;
  ttlMinutes?: number;
  code?: string;
  now?: Date;
}): { code: string; record: OtpRecord } {
  const currentTime = params.now || new Date();
  const code = params.code || generateOtpCode();
  const ttl = params.ttlMinutes ?? DEFAULT_OTP_TTL_MINUTES;
  const expiresAt = new Date(currentTime.getTime() + ttl * 60 * 1000);

  const record: OtpRecord = {
    id: params.id || crypto.randomUUID(),
    phone: params.phone,
    codeHash: hashOtpCode(code),
    purpose: params.purpose,
    attempts: 0,
    expiresAt,
    usedAt: null,
    createdAt: currentTime,
  };

  return { code, record };
}

export function verifyOtpCode(
  record: OtpRecord,
  inputCode: string,
  now?: Date
): OtpVerificationResult {
  const currentTime = now || new Date();

  // 1. Check if already used
  if (record.usedAt !== null) {
    return {
      valid: false,
      error: "ALREADY_USED",
      updatedRecord: record,
    };
  }

  // 2. Check attempt limits
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    return {
      valid: false,
      error: "MAX_ATTEMPTS_EXCEEDED",
      updatedRecord: record,
    };
  }

  // 3. Check expiration
  if (currentTime.getTime() > record.expiresAt.getTime()) {
    return {
      valid: false,
      error: "EXPIRED",
      updatedRecord: record,
    };
  }

  // 4. Verify code match
  const inputHash = hashOtpCode(inputCode);
  const inputBuffer = Buffer.from(inputHash);
  const targetBuffer = Buffer.from(record.codeHash);

  let isMatch = false;
  if (inputBuffer.length === targetBuffer.length) {
    isMatch = crypto.timingSafeEqual(inputBuffer, targetBuffer);
  }

  if (!isMatch) {
    const updatedAttempts = record.attempts + 1;
    const isExceededNow = updatedAttempts >= MAX_OTP_ATTEMPTS;

    const updatedRecord: OtpRecord = {
      ...record,
      attempts: updatedAttempts,
    };

    return {
      valid: false,
      error: isExceededNow ? "MAX_ATTEMPTS_EXCEEDED" : "INVALID_CODE",
      updatedRecord,
    };
  }

  // 5. Code is valid
  const updatedRecord: OtpRecord = {
    ...record,
    usedAt: currentTime,
  };

  return {
    valid: true,
    updatedRecord,
  };
}
