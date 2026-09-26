/**
 * Connection handling shared by move-db, backup and restore drill.
 * - TLS is mandatory for every non-loopback host (sslmode disable/allow/prefer is refused).
 * - Supabase's transaction pooler (6543) cannot hold a snapshot or run pg_dump: we switch to the
 *   session pooler on the same host (port 5432), per Supabase "Connecting to Postgres" docs.
 * - libpq tools get credentials through a 0600 PGPASSFILE, never argv (visible in `ps`).
 */
import { UsageError } from "./args";

export type SslMode = "disable" | "require" | "verify-ca" | "verify-full";

export interface ConnInfo {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  sslmode: SslMode;
}

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function isLoopback(host: string): boolean {
  return LOOPBACK.has(host.toLowerCase());
}

/** Parses a postgres URL. Error messages never include the URL. */
export function parseConnUrl(raw: string, label: string): ConnInfo {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UsageError(`${label}: not a valid postgres:// URL`);
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new UsageError(`${label}: expected postgres:// or postgresql:// URL`);
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host) throw new UsageError(`${label}: host is missing`);
  const requested = (url.searchParams.get("sslmode") ?? "").toLowerCase();
  let sslmode: SslMode;
  if (["require", "verify-ca", "verify-full"].includes(requested)) sslmode = requested as SslMode;
  else if (isLoopback(host)) sslmode = requested === "require" ? "require" : "disable";
  else if (requested === "" ) sslmode = "require";
  else {
    throw new UsageError(
      `${label}: sslmode=${requested} is refused for a remote host; data must travel over TLS. ` +
        `/ Masofaviy bazaga faqat TLS (sslmode=require) bilan ulanamiz.`,
    );
  }
  return {
    host,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")) || "postgres",
    sslmode,
  };
}

/** Transaction pooler → session pooler on the same Supabase host. Other hosts are returned as-is. */
export function toSessionConnection(info: ConnInfo): { info: ConnInfo; switched: boolean } {
  if (info.port === 6543 && /\.pooler\.supabase\.com$/i.test(info.host)) {
    return { info: { ...info, port: 5432 }, switched: true };
  }
  return { info, switched: false };
}

export function assertNotTransactionPooler(info: ConnInfo, label: string): void {
  if (info.port === 6543) {
    throw new UsageError(
      `${label}: port 6543 is a transaction pooler; pg_dump/pg_restore need a session or direct connection (5432).`,
    );
  }
}

/** Same database? Compares Supabase project refs when present, else host:port/db. */
export function sameDatabase(a: ConnInfo, b: ConnInfo): boolean {
  const ref = (c: ConnInfo) =>
    c.user.match(/^[^.]+\.([a-z0-9]{20})$/)?.[1] ?? c.host.match(/^db\.([a-z0-9]{20})\.supabase\.co$/)?.[1] ?? null;
  const ra = ref(a);
  const rb = ref(b);
  if (ra && rb) return ra === rb;
  const key = (c: ConnInfo) => `${c.host.toLowerCase()}:${c.port}/${c.database}`;
  return key(a) === key(b);
}

/** One `.pgpass` line; `:` and `\` must be escaped per libpq docs (33.16 The Password File). */
export function pgpassLine(info: ConnInfo): string {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
  return [info.host, String(info.port), info.database, info.user, info.password].map(esc).join(":");
}

/** Environment for libpq tools (pg_dump, pg_restore). The password comes from PGPASSFILE. */
export function libpqEnv(info: ConnInfo, passfile: string): Record<string, string> {
  return {
    PGHOST: info.host,
    PGPORT: String(info.port),
    PGUSER: info.user,
    PGDATABASE: info.database,
    PGSSLMODE: info.sslmode,
    PGPASSFILE: passfile,
    PGAPPNAME: "naqsh-ops",
    PGCONNECT_TIMEOUT: "20",
  };
}

/** Options for postgres-js (the app's driver). `prepare: false` is safe on every pooler. */
export function postgresJsOptions(info: ConnInfo) {
  return {
    host: info.host,
    port: info.port,
    user: info.user,
    password: info.password,
    database: info.database,
    // postgres-js has no verify-ca: any mode other than require verifies the full chain + hostname.
    ssl: info.sslmode === "disable" ? false : info.sslmode === "require" ? ("require" as const) : ("verify-full" as const),
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 20,
    onnotice: () => {},
    connection: { application_name: "naqsh-ops" },
  } as const;
}
