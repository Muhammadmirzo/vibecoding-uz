// Shared row-level helpers of the chat service (L19: one responsibility per file).
// Extracted from chat.service.ts without changing any behaviour.
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, chatConversations, chatMessages } from "@/db/schema";
import { ServiceError } from "@/lib/http/errors";
import type { ChatMessageDto } from "../contracts";
import { messageDto } from "./chat-dto";

export type ConversationRow = typeof chatConversations.$inferSelect;
export type MessageRow = typeof chatMessages.$inferSelect;

/** Overlap the cursor so a row committed late (concurrent visitor/admin/AI writes) is not missed. */
export const CURSOR_OVERLAP_MS = 15_000;

export async function audit(input: {
  actorId?: string | null;
  action: string;
  conversationId: string;
  details?: Record<string, unknown>;
  ip?: string;
}) {
  await db.insert(auditLogs).values({
    userId: input.actorId ?? null,
    action: input.action,
    entityType: "chat_conversation",
    entityId: input.conversationId,
    details: input.details ?? {},
    ipAddress: input.ip || null,
  });
}

/** Map rows to DTOs with the quoted parent of every reply (one extra query, only for parents outside the page). */
export async function messageDtos(rows: MessageRow[]): Promise<ChatMessageDto[]> {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const missing = [...new Set(rows.map((row) => row.replyToId).filter((id): id is string => Boolean(id) && !byId.has(id!)))];
  if (missing.length) {
    const parents = await db.select().from(chatMessages).where(inArray(chatMessages.id, missing));
    parents.forEach((parent) => byId.set(parent.id, parent));
  }
  return rows.map((row) => messageDto(row, row.replyToId ? byId.get(row.replyToId) ?? null : null));
}

export async function requireConversation(id: string): Promise<ConversationRow> {
  const [row] = await db.select().from(chatConversations).where(eq(chatConversations.id, id)).limit(1);
  if (!row) throw new ServiceError("NOT_FOUND", "Suhbat topilmadi", 404);
  return row;
}
