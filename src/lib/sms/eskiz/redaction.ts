/** Redacts phone numbers for safe logging (+99890***567). */
export function redactPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length >= 9) {
    const fullDigits = digits.startsWith("998") ? digits : `998${digits}`;
    return `+${fullDigits.slice(0, 5)}***${fullDigits.slice(-3)}`;
  }
  return "***";
}

/** Formats Uzbek phone numbers into Eskiz format. */
export function normalizePhoneForEskiz(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, "");
  if (cleaned.startsWith("8") && cleaned.length === 10) {
    cleaned = "998" + cleaned.slice(1);
  } else if (cleaned.length === 9) {
    cleaned = "998" + cleaned;
  }
  return cleaned;
}
