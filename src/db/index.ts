import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL production uchun majburiy");
}
// Local/test convenience only. Production fails closed above.
const effectiveConnectionString = connectionString ?? "postgres://postgres:postgres@localhost:5432/vibecoding_db";

const maxConnections = process.env.DATABASE_MAX_CONNECTIONS
  ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10) || 10
  : 10;

const client = postgres(effectiveConnectionString, {
  max: Math.max(1, Math.min(maxConnections, 100)),
  idle_timeout: 30,
  connect_timeout: 10,
  max_lifetime: 1800,
  onnotice: () => {},
});

export const db = drizzle(client, { schema });

/**
 * drizzle's postgres-js driver makes the date/time serializers transparent because typed
 * columns convert Dates themselves. A Date passed as a raw `sql` param has no column, so
 * postgres-js received the Date object and threw ERR_INVALID_ARG_TYPE in production
 * (rate limiter, analytics reports). Serialize Dates to ISO here, once, for every query.
 */
export function serializeDateParam(value: unknown): unknown {
  return value instanceof Date ? value.toISOString() : value;
}
for (const type of [1184, 1082, 1083, 1114]) {
  client.options.serializers[type] = serializeDateParam;
}

type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function getErrorDetails(error: unknown): { code: unknown; message: string } {
  if (typeof error !== "object" || error === null) {
    return { code: undefined, message: "" };
  }

  const candidate = error as { code?: unknown; message?: unknown };
  return {
    code: candidate.code,
    message: typeof candidate.message === "string" ? candidate.message : "",
  };
}

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  backoffFactor?: number;
}

/**
 * Executes a database operation with exponential backoff retries on transient connection errors or deadlocks.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const retries = options.retries ?? 3;
  const delayMs = options.delayMs ?? 100;
  const backoffFactor = options.backoffFactor ?? 2;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const { code: errCode, message: errMsg } = getErrorDetails(err);

      const isTransient =
        errCode === "40001" || // serialization_failure
        errCode === "40P01" || // deadlock_detected
        errCode === "57P01" || // admin_shutdown
        errCode === "08006" || // connection_failure
        errCode === "08001" || // sqlclient_unable_to_establish_sqlconnection
        errCode === "08004" || // sqlserver_rejected_establishment_of_sqlconnection
        errCode === "ECONNRESET" ||
        errCode === "ETIMEDOUT" ||
        errCode === "ECONNREFUSED" ||
        errMsg.includes("connection lost") ||
        errMsg.includes("Connection terminated") ||
        errMsg.includes("timeout") ||
        errMsg.includes("deadlock");

      if (!isTransient || attempt === retries) {
        throw err;
      }

      const backoff = delayMs * Math.pow(backoffFactor, attempt) + Math.random() * 50;
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  throw lastError;
}

const localLocks = new Set<string>();

/**
 * Executes a database transaction wrapped in a PostgreSQL advisory lock (or fallback in-memory mutex)
 * to prevent double-spending & race conditions under high concurrency.
 */
export async function withTransactionLock<T>(
  lockKey: string | number,
  fn: (tx?: DatabaseTransaction | null) => Promise<T>
): Promise<T> {
  const strKey = String(lockKey);

  // In-process serialized lock queue
  while (localLocks.has(strKey)) {
    await new Promise((r) => setTimeout(r, 20));
  }
  localLocks.add(strKey);

  try {
    return await withRetry(async () => {
      try {
        return await db.transaction(async (tx) => {
          try {
            // Attempt Postgres advisory transaction lock
            const safeKey = strKey.replace(/'/g, "''");
            await tx.execute(`SELECT pg_advisory_xact_lock(hashtext('${safeKey}'))`);
          } catch {
            // Fallback if advisory lock fails or unsupported
          }
          return await fn(tx);
        });
      } catch (err: unknown) {
        // A local mutex cannot replace a database transaction. Fail closed so
        // callers return a retryable 503 instead of performing partial writes.
        throw err;
      }
    });
  } finally {
    localLocks.delete(strKey);
  }
}

/**
 * Diagnostic health check function for DB connection readiness.
 */
export async function checkDbHealth(): Promise<{ status: "healthy" | "unhealthy"; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await db.execute("SELECT 1");
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (err: unknown) {
    const { message } = getErrorDetails(err);
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: message || String(err),
    };
  }
}

