const BROWSERS: ReadonlyArray<readonly [string, RegExp]> = [
  ["Edge", /Edg\//i],
  ["Chrome", /Chrome|CriOS/i],
  ["Firefox", /Firefox|FxiOS/i],
  ["Safari", /Safari/i],
];

const SYSTEMS: ReadonlyArray<readonly [string, RegExp]> = [
  ["Windows", /Windows/i],
  ["macOS", /Mac OS X/i],
  ["Android", /Android/i],
  ["iOS", /iPhone|iPad|iPod/i],
  ["Linux", /Linux/i],
];

export function formatTelegramDevice(userAgent: string | null | undefined): string {
  if (!userAgent) return "Noma'lum qurilma";
  const browser = BROWSERS.find(([, pattern]) => pattern.test(userAgent))?.[0];
  const system = SYSTEMS.find(([, pattern]) => pattern.test(userAgent))?.[0];
  return [browser, system].filter((value): value is string => Boolean(value)).join(" · ") || "Noma'lum qurilma";
}

export function formatTelegramRequestTime(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Tashkent",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
