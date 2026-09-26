/**
 * Tiny structured logger: one JSON object per line, stable `event` names, request id for correlation.
 * Never pass secrets, tokens, full request bodies or personal data in `fields` (allow-list what you log).
 */
import { requestIdFrom } from "./request-id";

type Level = "debug" | "info" | "warn" | "error";
export type LogFields = Record<string, string | number | boolean | null | undefined>;

export interface Logger {
  debug(event: string, fields?: LogFields): void;
  info(event: string, fields?: LogFields): void;
  warn(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
  child(fields: LogFields): Logger;
}

/** Safe summary of an unknown error: class name and Postgres/Node code, never the message (may hold SQL/PII). */
export function errorFields(error: unknown): LogFields {
  if (typeof error !== "object" || error === null) return { errorName: typeof error };
  const candidate = error as { name?: unknown; code?: unknown };
  return {
    errorName: typeof candidate.name === "string" ? candidate.name : "Error",
    errorCode: typeof candidate.code === "string" || typeof candidate.code === "number" ? String(candidate.code) : undefined,
  };
}

function write(level: Level, event: string, base: LogFields, fields: LogFields | undefined): void {
  const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...base, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "debug") console.debug(line);
  else console.info(line);
}

export function createLogger(base: LogFields = {}): Logger {
  return {
    debug: (event, fields) => write("debug", event, base, fields),
    info: (event, fields) => write("info", event, base, fields),
    warn: (event, fields) => write("warn", event, base, fields),
    error: (event, fields) => write("error", event, base, fields),
    child: (fields) => createLogger({ ...base, ...fields }),
  };
}

export const log = createLogger();

/** Logger bound to one request: every line carries its `requestId` and the entry point (route). */
export function requestLogger(request: Request, route: string): Logger {
  return log.child({ requestId: requestIdFrom(request), route });
}
