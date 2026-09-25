/**
 * Audit trail for MCP write tools. Mirrors the admin convention
 * (src/features/crm/server/*.repository.ts recordAuditTx): the audit_logs
 * insert runs INSIDE the same transaction as the write, so a failed audit
 * insert rolls the write back — it never passes silently.
 *
 * Actor model: audit_logs has no actor column; user_id is null (the MCP
 * caller is a bearer token, not a user) and user_email is the literal
 * "mcp" so the /admin audit table shows the actor, with details.actor too.
 */
import { auditLogs } from "../../src/db/schema";
import type { db as dbInstance } from "../../src/db";

export const MCP_AUDIT_ACTOR = "mcp";

export type DbExecutor = Pick<typeof dbInstance, "select" | "selectDistinct" | "insert" | "update">;

export interface McpAuditInput {
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
}

export async function recordMcpAudit(ex: DbExecutor, input: McpAuditInput): Promise<void> {
  await ex.insert(auditLogs).values({
    userId: null,
    userEmail: MCP_AUDIT_ACTOR,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    details: { ...input.details, actor: MCP_AUDIT_ACTOR, source: "mcp_server" },
    ipAddress: null,
  });
}
