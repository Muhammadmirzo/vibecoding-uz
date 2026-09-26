/**
 * Read-only checks on source and target before anything is written anywhere.
 */
import postgres from "postgres";
import { isLoopback, postgresJsOptions, sameDatabase, type ConnInfo } from "./conn";
import {
  AVAILABLE_EXTENSIONS_SQL, FROZEN_STATE_SQL, OCCUPANCY_SQL, REQUIRED_EXTENSIONS_SQL, SERVER_INFO_SQL,
} from "./ops-sql";
import { APP_SCHEMAS, REQUIRED_TABLES } from "./verify-sql";

export interface ServerInfo {
  major: number;
  role: string;
  database: string;
  bytes: number;
  ssl: boolean;
}

export interface PreflightResult {
  source: ServerInfo & { extensions: { name: string; schema: string }[]; frozen: boolean };
  target?: ServerInfo;
  problems: string[];
  notes: string[];
}

export function connect(info: ConnInfo) {
  return postgres(postgresJsOptions(info));
}

async function serverInfo(sql: postgres.Sql): Promise<ServerInfo> {
  const [r] = await sql.unsafe<{ version_num: number; role: string; database: string; bytes: string; ssl: boolean }[]>(SERVER_INFO_SQL);
  return { major: Math.floor(r.version_num / 10000), role: r.role, database: r.database, bytes: Number(r.bytes), ssl: r.ssl };
}

/**
 * TLS is enforced on the client side: every non-loopback connection uses sslmode=require or stricter
 * (parseConnUrl), and both libpq and postgres-js fail instead of falling back to plain text.
 * pg_stat_ssl only describes the pooler→Postgres leg, which is internal behind Supavisor/PgBouncer,
 * so it is reported as a note, not a failure.
 */
function tlsNote(label: string, info: ConnInfo, server: ServerInfo): string | null {
  if (isLoopback(info.host) || server.ssl) return null;
  return `${label}: client→server TLS enforced (sslmode=${info.sslmode}); server-side backend reports no TLS (normal behind a pooler)`;
}

export async function inspectSource(info: ConnInfo): Promise<PreflightResult["source"] & { tlsNote: string | null; missingTables: string[] }> {
  const sql = connect(info);
  try {
    const server = await serverInfo(sql);
    const schemas = [...APP_SCHEMAS];
    const extensions = await sql.unsafe<{ name: string; schema: string }[]>(REQUIRED_EXTENSIONS_SQL, [schemas]);
    const [{ frozen }] = await sql.unsafe<{ frozen: boolean }[]>(FROZEN_STATE_SQL);
    const missingTables: string[] = [];
    for (const name of REQUIRED_TABLES) {
      const [{ ok }] = await sql.unsafe<{ ok: boolean }[]>("SELECT to_regclass($1) IS NOT NULL AS ok", [name]);
      if (!ok) missingTables.push(name);
    }
    return { ...server, extensions: [...extensions], frozen, tlsNote: tlsNote("SOURCE", info, server), missingTables };
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function preflight(source: ConnInfo, target: ConnInfo | null): Promise<PreflightResult> {
  const problems: string[] = [];
  const notes: string[] = [];
  const src = await inspectSource(source);
  if (src.tlsNote) notes.push(src.tlsNote);
  for (const t of src.missingTables) problems.push(`SOURCE: ${t} not found — is this the right database?`);
  if (src.frozen) notes.push("SOURCE is currently frozen (read-only). Run `npm run move -- db --unfreeze` to undo if unintended.");
  notes.push(`SOURCE: PostgreSQL ${src.major}, ${(src.bytes / 1e6).toFixed(1)} MB, role ${src.role}`);
  if (src.extensions.length) notes.push(`SOURCE needs extensions: ${src.extensions.map((e) => e.name).join(", ")}`);
  const { tlsNote: _t, missingTables: _m, ...sourceInfo } = src;
  const result: PreflightResult = { source: sourceInfo, problems, notes };
  if (!target) return result;

  if (sameDatabase(source, target)) {
    problems.push("TARGET is the same database as SOURCE. Refusing. / Manba va manzil bir xil baza.");
    return result;
  }
  const sql = connect(target);
  try {
    const tgt = await serverInfo(sql);
    result.target = tgt;
    const tn = tlsNote("TARGET", target, tgt);
    if (tn) notes.push(tn);
    notes.push(`TARGET: PostgreSQL ${tgt.major}, role ${tgt.role}, database ${tgt.database}`);
    if (tgt.major < src.major) {
      problems.push(`TARGET runs PostgreSQL ${tgt.major}, older than SOURCE ${src.major}; a dump is only guaranteed to load into the same or newer major.`);
    }
    const occupied = await sql.unsafe<{ object: string }[]>(OCCUPANCY_SQL, [[...APP_SCHEMAS]]);
    if (occupied.length) {
      problems.push(
        `TARGET is not empty (e.g. ${occupied.map((o) => o.object).join(", ")}). Use a fresh database. ` +
          `/ Manzil baza bo'sh emas — yangi bo'sh baza bering.`,
      );
    }
    const names = src.extensions.map((e) => e.name);
    if (names.length) {
      const avail = new Set((await sql.unsafe<{ name: string }[]>(AVAILABLE_EXTENSIONS_SQL, [names])).map((r) => r.name));
      const missing = names.filter((n) => !avail.has(n));
      if (missing.length) problems.push(`TARGET cannot install extensions: ${missing.join(", ")}`);
    }
    return result;
  } finally {
    await sql.end({ timeout: 5 });
  }
}
