import { timingSafeEqual } from "node:crypto";

export interface PaymeRpcRequest {
  method: string;
  params: unknown;
  id: number | string;
}

export interface PaymeError {
  code: number;
  message: { uz: string; ru: string; en: string };
  data?: unknown;
}

export interface PaymeRpcResponse {
  result?: unknown;
  error?: PaymeError;
  id: number | string;
}

export interface PaymeTransactionRecord {
  id: string;
  time: number;
  amount: number;
  account?: Record<string, unknown>;
  create_time: number;
  perform_time: number;
  cancel_time: number;
  state: number;
  reason: string | number | null;
}

export const PAYME_ERRORS = {
  INVALID_AMOUNT: { code: -31001, message: { uz: "Noto'g'ri summasi", ru: "Неверная сумма", en: "Invalid amount" } },
  TRANSACTION_NOT_FOUND: { code: -31003, message: { uz: "Tranzaksiya topilmadi", ru: "Транзакция не найдена", en: "Transaction not found" } },
  CANNOT_PERFORM: { code: -31008, message: { uz: "Tranzaksiyani bajarib bo'lmaydi", ru: "Невозможно выполнить транзакцию", en: "Cannot perform transaction" } },
  AUTH_ERROR: { code: -32504, message: { uz: "Autentifikatsiya xatosi", ru: "Ошибка аутентификации", en: "Authentication error" } },
} satisfies Record<string, PaymeError>;

export function createPaymeSuccessResponse(id: number | string, result: unknown): PaymeRpcResponse {
  return { id, result };
}

export function createPaymeErrorResponse(id: number | string, error: PaymeError): PaymeRpcResponse {
  return { id, error };
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

/** Verifies Payme's HTTP Basic credentials without any test bypass. */
export function verifyPaymeAuth(authHeader: string | null | undefined, paymeKey: string | undefined): boolean {
  if (!authHeader || !paymeKey || !authHeader.startsWith("Basic ")) return false;
  const token = authHeader.slice(6).trim();
  if (!token || !/^[A-Za-z0-9+/]+={0,2}$/.test(token)) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 1) return false;
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    return username === "Paycom" && safeEqual(password, paymeKey);
  } catch {
    return false;
  }
}

export function amountMatches(expectedSum: string, providerAmount: number): boolean {
  if (!Number.isSafeInteger(providerAmount) || providerAmount <= 0) return false;
  const normalized = expectedSum.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return false;
  const [whole, fraction = ""] = normalized.split(".");
  const expectedMinorUnits = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(expectedMinorUnits) && expectedMinorUnits === providerAmount;
}

export function getPaymeTransactionId(id: string | number | undefined): string {
  return id === undefined ? "" : String(id);
}

export function getPaymeOrderId(params: { account?: Record<string, unknown> }): string {
  const value = params.account?.order_id;
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

/** Compatibility no-op: webhook idempotency is persisted in PostgreSQL. */
export const paymeStore = { clear: (): void => undefined };
