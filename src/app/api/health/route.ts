import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { errorFields, requestLogger } from "@/lib/log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Uptime probe: a paused/down database must page someone, not be discovered by users. */
// 5 s: a cold serverless instance must open a TLS connection to the pooler first (measured >2 s from afar).
const DB_TIMEOUT_MS = 5000;
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error("health check timed out"), { name: "TimeoutError" })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function GET(request: Request) {
  const started = Date.now();
  try {
    await withTimeout(db.execute(sql`select 1`), DB_TIMEOUT_MS);
    return NextResponse.json({ status: "ok" }, { status: 200, headers: NO_STORE });
  } catch (error) {
    requestLogger(request, "/api/health").error("health_db_failed", { latencyMs: Date.now() - started, ...errorFields(error) });
    return NextResponse.json({ status: "degraded" }, { status: 503, headers: NO_STORE });
  }
}
