import crypto from "crypto";
import { OtpRecord, OtpVerificationResult, verifyOtpCode as verifyOtpRecordCode } from "./otp";

const ITERATIONS = 10000;
const KEY_LEN = 64;
const DIGEST = "sha512";

/**
 * Normalizes Uzbek phone numbers to standard format (+998XXXXXXXXX)
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("998") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return phone.startsWith("+") ? phone : `+${phone}`;
}

/**
 * Hashes a 6-digit OTP code using SHA-256
 */
export function hashOtpCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Overloaded function: verifies string vs hash OR OtpRecord object.
 */
export function verifyOtpCode(codeOrRecord: string | OtpRecord, storedHashOrCode: string, now?: Date): any {
  if (typeof codeOrRecord === "object" && codeOrRecord !== null) {
    return verifyOtpRecordCode(codeOrRecord, storedHashOrCode, now);
  }
  const codeHash = hashOtpCode(codeOrRecord);
  const codeBuffer = Buffer.from(codeHash);
  const storedBuffer = Buffer.from(storedHashOrCode);
  if (codeBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(codeBuffer, storedBuffer);
}

/**
 * Hashes a plain password with a cryptographically secure random salt using PBKDF2.
 * Output format: `salt:hash` (hex-encoded)
 */
export function hashPassword(password: string): Promise<string> {
  if (!password) {
    return Promise.reject(new Error("Password must not be empty"));
  }
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verifies a plain password against a stored `salt:hash` string.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) {
    return Promise.resolve(false);
  }

  const parts = storedHash.split(":");
  if (parts.length !== 2) {
    return Promise.resolve(false);
  }

  const [salt, originalHash] = parts;
  if (!salt || !originalHash) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return resolve(false);
      const originalBuffer = Buffer.from(originalHash, "hex");
      const derivedBuffer = derivedKey;

      if (originalBuffer.length !== derivedBuffer.length) {
        return resolve(false);
      }

      try {
        resolve(crypto.timingSafeEqual(originalBuffer, derivedBuffer));
      } catch {
        resolve(false);
      }
    });
  });
}
