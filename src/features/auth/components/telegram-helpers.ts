// Pure helpers for the Telegram Login Widget flow (framework-free, unit-testable).

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramUser {
  id: number;
  firstName: string;
  username?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getBotName(env?: Record<string, string | undefined>): string | null {
  const source = env ?? process.env;
  const name = source.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
  if (!name || name.trim().length === 0) return null;
  return name.trim().replace(/^@/, "");
}

export function mapTelegramData(raw: unknown): TelegramAuthData | null {
  if (!isRecord(raw)) return null;
  const { id, first_name, auth_date, hash } = raw;
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) return null;
  if (typeof first_name !== "string" || first_name.trim().length === 0) return null;
  if (typeof auth_date !== "number" || !Number.isInteger(auth_date) || auth_date <= 0)
    return null;
  if (typeof hash !== "string" || hash.length === 0) return null;

  const data: TelegramAuthData = {
    id,
    first_name: first_name.trim(),
    auth_date,
    hash,
  };
  if (typeof raw.last_name === "string" && raw.last_name.length > 0)
    data.last_name = raw.last_name;
  if (typeof raw.username === "string" && raw.username.length > 0)
    data.username = raw.username;
  if (typeof raw.photo_url === "string" && raw.photo_url.length > 0)
    data.photo_url = raw.photo_url;
  return data;
}

export function getTelegramErrorMessage(status: number): string {
  if (status === 400) return "Telegram ma'lumotlari noto'g'ri. Qaytadan urinib ko'ring.";
  if (status === 401) return "Telegram imzosi tasdiqlanmadi. Qaytadan urinib ko'ring.";
  if (status === 422)
    return "Bu Telegram hisobi hali ulanmagan. Avval telefon raqamingiz bilan kiring (SMS kod), keyin botda /start ni bosing — hisob ulanadi.";
  if (status === 410) return "Kirish muddati o'tgan. Telegram orqali qaytadan kiring.";
  if (status === 429) return "Juda ko'p urinish. Birozdan keyin qaytadan urinib ko'ring.";
  if (status >= 500) return "Server xatosi. Birozdan keyin qaytadan urinib ko'ring.";
  return "Telegram orqali kirishda xatolik. Qaytadan urinib ko'ring.";
}
