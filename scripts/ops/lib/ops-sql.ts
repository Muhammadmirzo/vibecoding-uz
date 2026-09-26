/**
 * Pure SQL used by the ops scripts: maintenance freeze, security baseline, preflight probes.
 */

import { quoteIdent } from "./verify-sql";

/**
 * Maintenance freeze = every NEW session of the app's role IN THE SOURCE DATABASE starts read-only.
 * Host-agnostic and instant (no redeploy). Scoped to one database so another database on the same
 * server (e.g. the move target) stays writable. Writes then fail with SQLSTATE 25006, which the app
 * answers with 503 "maintenance" (src/lib/http/errors.ts). A role may change its own session defaults.
 */
export function freezeSql(database: string): string {
  return `ALTER ROLE CURRENT_USER IN DATABASE ${quoteIdent(database)} SET default_transaction_read_only = on`;
}

/** Unfreeze: this session must itself be read-write before it may run ALTER ROLE. */
export function unfreezeSql(database: string): string[] {
  return [
    "SET default_transaction_read_only = off",
    `ALTER ROLE CURRENT_USER IN DATABASE ${quoteIdent(database)} RESET default_transaction_read_only`,
  ];
}

/** Ends the role's other sessions on this database so pooled connections pick up the new default. */
export const TERMINATE_OTHERS_SQL = `
SELECT count(pg_terminate_backend(pid))::int AS terminated
FROM pg_stat_activity
WHERE usename = current_user AND datname = current_database() AND pid <> pg_backend_pid()
  AND backend_type = 'client backend'`;

/** Role+database setting as stored in pg_db_role_setting (what new sessions will get). */
export const FROZEN_STATE_SQL = `
SELECT EXISTS (
  SELECT 1 FROM pg_db_role_setting s
  JOIN pg_roles r ON r.oid = s.setrole
  JOIN pg_database d ON d.oid = s.setdatabase
  WHERE r.rolname = current_user AND d.datname = current_database()
    AND 'default_transaction_read_only=on' = ANY(s.setconfig)
) AS frozen`;

/**
 * Our security baseline, re-applied on every target: Supabase-style API roles (if present) get no
 * access to app data, and every public table has RLS on (no policies = deny for those roles).
 */
export const SECURITY_BASELINE_SQL = `
DO $baseline$
DECLARE r record; api_role text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', api_role);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', api_role);
      EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I', api_role);
      IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'drizzle') THEN
        EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA drizzle FROM %I', api_role);
        EXECUTE format('REVOKE ALL ON SCHEMA drizzle FROM %I', api_role);
      END IF;
    END IF;
  END LOOP;
  FOR r IN SELECT c.relname FROM pg_class c
           WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.relname);
  END LOOP;
END
$baseline$`;

/** Rows returned = baseline violations (grants to API roles on app schemas). */
export const BASELINE_GRANTS_SQL = `
SELECT table_schema || '.' || table_name || ' → ' || grantee AS issue
FROM information_schema.role_table_grants
WHERE table_schema IN ('public', 'drizzle') AND grantee IN ('anon', 'authenticated', 'PUBLIC')`;

export const SERVER_INFO_SQL = `
SELECT current_setting('server_version_num')::int AS version_num, current_user AS role,
  current_database() AS database, pg_database_size(current_database())::bigint::text AS bytes,
  COALESCE((SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()), false) AS ssl`;

/** $1 = text[] schemas. Anything here means "target is not empty". */
export const OCCUPANCY_SQL = `
SELECT n.nspname || '.' || c.relname AS object FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = ANY($1::text[]) AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
UNION ALL
SELECT n.nspname || '.' || t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = ANY($1::text[]) AND t.typtype IN ('e', 'd', 'r')
LIMIT 5`;

/** $1 = text[] schemas. Extensions whose member objects our schemas depend on (e.g. a uuid-ossp default). */
export const REQUIRED_EXTENSIONS_SQL = `
SELECT DISTINCT e.extname AS name, en.nspname AS schema
FROM pg_depend d
JOIN pg_depend m ON m.classid = d.refclassid AND m.objid = d.refobjid AND m.deptype = 'e'
  AND m.refclassid = 'pg_extension'::regclass
JOIN pg_extension e ON e.oid = m.refobjid
JOIN pg_namespace en ON en.oid = e.extnamespace
CROSS JOIN LATERAL pg_identify_object(d.classid, d.objid, d.objsubid) o
WHERE d.deptype = 'n' AND e.extname <> 'plpgsql'
  AND (o.schema = ANY($1::text[])
    OR (d.classid = 'pg_attrdef'::regclass AND EXISTS (
      SELECT 1 FROM pg_attrdef ad JOIN pg_class c ON c.oid = ad.adrelid
      WHERE ad.oid = d.objid AND c.relnamespace::regnamespace::text = ANY($1::text[]))))`;

/** $1 = text[] extension names → the ones this server can install. */
export const AVAILABLE_EXTENSIONS_SQL = `SELECT name FROM pg_available_extensions WHERE name = ANY($1::text[])`;
