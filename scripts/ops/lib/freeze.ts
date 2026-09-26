/**
 * Maintenance mode on the SOURCE database (see freezeSql in ops-sql.ts for the design).
 */
import type { ConnInfo } from "./conn";
import { TERMINATE_OTHERS_SQL, freezeSql, unfreezeSql } from "./ops-sql";
import { connect } from "./preflight";

/**
 * A pooler (Supavisor/PgBouncer session mode) may hand our backend — started before the freeze and
 * therefore read-write — to the app later. Ending it guarantees every future session is read-only.
 */
async function endOwnBackend(sql: ReturnType<typeof connect>): Promise<void> {
  try {
    await sql.unsafe("SELECT pg_terminate_backend(pg_backend_pid())");
  } catch {
    // expected: the server closes this very connection
  }
}

/** The server's own name for the database (a pooler may map the URL's name). */
async function currentDatabase(sql: ReturnType<typeof connect>): Promise<string> {
  const [{ db }] = await sql.unsafe<{ db: string }[]>("SELECT current_database() AS db");
  return db;
}

export async function freezeSource(source: ConnInfo, log: (line: string) => void): Promise<void> {
  const sql = connect(source);
  try {
    await sql.unsafe(freezeSql(await currentDatabase(sql)));
    const [{ terminated }] = await sql.unsafe<{ terminated: number }[]>(TERMINATE_OTHERS_SQL);
    log(`• Source is now READ-ONLY (${terminated} open session(s) reconnected) / manba faqat o'qish rejimida`);
    await endOwnBackend(sql);
  } finally {
    await sql.end({ timeout: 5 });
  }
  // Prove it: a brand-new session must start read-only.
  const probe = connect(source);
  try {
    const [{ ro }] = await probe.unsafe<{ ro: string }[]>("SELECT current_setting('default_transaction_read_only') AS ro");
    if (ro !== "on") throw new Error("freeze did not take effect (new sessions are still read-write)");
  } finally {
    await probe.end({ timeout: 5 });
  }
}

export async function unfreezeSource(source: ConnInfo, log: (line: string) => void): Promise<void> {
  const sql = connect(source);
  try {
    for (const statement of unfreezeSql(await currentDatabase(sql))) await sql.unsafe(statement);
    // Sessions opened while frozen keep read-only until they reconnect.
    await sql.unsafe(TERMINATE_OTHERS_SQL);
    log("• Source is READ-WRITE again / manba yana yozish rejimida");
  } finally {
    await sql.end({ timeout: 5 });
  }
}
