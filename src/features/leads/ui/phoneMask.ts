export function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, "");
  const localDigits = digits.startsWith("998") ? digits.slice(3) : digits;
  const limited = localDigits.slice(0, 9);
  let formatted = "+998";
  if (limited.length > 0) formatted += " " + limited.slice(0, 2);
  if (limited.length > 2) formatted += " " + limited.slice(2, 5);
  if (limited.length > 5) formatted += "-" + limited.slice(5, 7);
  if (limited.length > 7) formatted += "-" + limited.slice(7, 9);
  return formatted;
}

export function isValidUzbekPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("998");
}

export function isValidTelegramUsername(value: string): boolean {
  return /^@[A-Za-z0-9_]{3,}$/.test(value.trim());
}
