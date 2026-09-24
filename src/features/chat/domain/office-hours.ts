export interface OfficeHours {
  start: number;
  end: number;
  tz: "Asia/Tashkent";
}

export function minutesInTimezone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  return hour * 60 + minute;
}

export function isOfficeOpen(date: Date, hours: OfficeHours): boolean {
  const current = minutesInTimezone(date, hours.tz);
  const start = hours.start * 60;
  const end = hours.end * 60;
  return start <= end ? current >= start && current < end : current >= start || current < end;
}
