import { and, asc, desc, eq, gt, gte, ne, notLike, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, chatConversations, chatMessages, leads } from "@/db/schema";
import { ServiceError } from "@/lib/http/errors";
import {
  type ChatConversationDto,
  type ChatMessageDto,
  type ConversationPatchInput,
  type SendMessageInput,
} from "../contracts";
import { conversationDto, messageDto } from "./chat-dto";
import { getChatSettings } from "./settings.service";
import { hashVisitorToken } from "./visitor-token";

type ConversationRow = typeof chatConversations.$inferSelect;

const CURSOR_OVERLAP_MS = 15_000;

async function audit(input: {
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

async function requireConversation(id: string): Promise<ConversationRow> {
  const [row] = await db.select().from(chatConversations).where(eq(chatConversations.id, id)).limit(1);
  if (!row) throw new ServiceError("NOT_FOUND", "Suhbat topilmadi", 404);
  return row;
}

export async function getVisitorConversation(token: string): Promise<ChatConversationDto | null> {
  try {
    const [row] = await db.select().from(chatConversations)
      .where(eq(chatConversations.visitorTokenHash, hashVisitorToken(token))).limit(1);
    return row ? conversationDto(row) : null;
  } catch (error) {
    // A not-yet-migrated deployment must not make the global launcher noisy.
    if (error && typeof error === "object" && "code" in error && error.code === "42P01") return null;
    throw error;
  }
}

export async function listMessages(token: string, after?: string): Promise<ChatMessageDto[]> {
  const conversation = await getVisitorConversation(token);
  if (!conversation) return [];
  const rows = await db.select().from(chatMessages).where(and(
    eq(chatMessages.conversationId, conversation.id),
    notLike(chatMessages.clientId, "draft:%"),
    // Overlap the cursor: a row committed late (concurrent visitor/admin/AI writes) can carry
    // an older created_at than the last one the client saw. The client dedupes by id.
    after ? gt(chatMessages.createdAt, new Date(new Date(after).getTime() - CURSOR_OVERLAP_MS)) : undefined,
  )).orderBy(asc(chatMessages.createdAt));
  return rows.map(messageDto);
}

export async function sendVisitorMessage(
  token: string,
  input: SendMessageInput,
  userId?: string | null,
): Promise<ChatMessageDto> {
  const tokenHash = hashVisitorToken(token);
  let conversation = (await db.select().from(chatConversations)
    .where(eq(chatConversations.visitorTokenHash, tokenHash)).limit(1))[0];

  if (!conversation) {
    const settings = await getChatSettings();
    // Two tabs/requests may create the same visitor's conversation at once: the unique
    // token index keeps one row and the loser re-reads it instead of failing with 500.
    [conversation] = await db.insert(chatConversations).values({
      visitorTokenHash: tokenHash,
      userId,
      displayName: input.name || "Mehmon",
      contactPhone: input.phone,
      contactTelegram: input.telegram,
      sourcePath: input.sourcePath,
      device: input.device,
      aiMode: settings.aiDefaultMode,
    }).onConflictDoNothing({ target: chatConversations.visitorTokenHash }).returning();
    conversation ??= (await db.select().from(chatConversations)
      .where(eq(chatConversations.visitorTokenHash, tokenHash)).limit(1))[0];
  }

  const [message] = await db.transaction(async (tx) => {
    const inserted = await tx.insert(chatMessages).values({
      conversationId: conversation.id,
      clientId: input.clientId,
      sender: "visitor",
      body: input.body,
    }).onConflictDoNothing({ target: [chatMessages.conversationId, chatMessages.clientId] }).returning();
    if (!inserted.length) return [];
    await tx.update(chatConversations).set({
      displayName: input.name || conversation.displayName,
      contactPhone: input.phone || conversation.contactPhone,
      contactTelegram: input.telegram || conversation.contactTelegram,
      userId: userId || conversation.userId,
      status: "pending",
      unreadForAdmin: sql`${chatConversations.unreadForAdmin} + 1`,
      unreadForVisitor: 0,
      lastMessageAt: inserted[0].createdAt,
    }).where(eq(chatConversations.id, conversation.id));
    return inserted;
  });
  if (!message) {
    // Same clientId raced in from a retry: return the stored message (idempotent send).
    const [stored] = await db.select().from(chatMessages).where(and(
      eq(chatMessages.conversationId, conversation.id), eq(chatMessages.clientId, input.clientId),
    )).limit(1);
    return messageDto(stored);
  }

  if ((input.phone || input.telegram) && !conversation.leadId) {
    const [lead] = await db.insert(leads).values({
      name: input.name || conversation.displayName,
      phone: input.phone,
      telegram: input.telegram,
      source: input.telegram ? "telegram" : "form",
    }).returning();
    [conversation] = await db.update(chatConversations)
      .set({ leadId: lead.id }).where(eq(chatConversations.id, conversation.id)).returning();
  }
  return messageDto(message);
}

export async function markConversationRead(
  tokenOrConversationId: string,
  reader: "visitor" | "admin",
  actorId?: string | null,
  ip?: string,
) {
  const conversation = reader === "visitor"
    ? await getVisitorConversation(tokenOrConversationId)
    : conversationDto(await requireConversation(tokenOrConversationId));
  if (!conversation) throw new ServiceError("NOT_FOUND", "Suhbat topilmadi", 404);
  const from = reader === "visitor" ? "visitor" : "admin";
  await db.transaction(async (tx) => {
    await tx.update(chatMessages).set({ readAt: new Date() }).where(and(
      eq(chatMessages.conversationId, conversation.id),
      ne(chatMessages.sender, from),
      sql`${chatMessages.readAt} is null`,
    ));
    await tx.update(chatConversations).set(reader === "visitor"
      ? { unreadForVisitor: 0 }
      : { unreadForAdmin: 0 }).where(eq(chatConversations.id, conversation.id));
  });
  if (reader === "admin") await audit({
    actorId, action: "chat.thread.read", conversationId: conversation.id, ip,
  });
}

export async function listConversations(
  actorId: string,
  filter: "open" | "pending" | "closed" | "assigned" | "all" = "open",
  query = "",
): Promise<ChatConversationDto[]> {
  const search = query.trim().toLowerCase();
  const rows = await db.select().from(chatConversations).orderBy(desc(chatConversations.lastMessageAt)).limit(200);
  return rows
    .filter((row) => filter === "all" || (filter === "assigned" ? row.assignedAdminId === actorId : row.status === filter))
    .filter((row) => !search || row.displayName.toLowerCase().includes(search) || (row.contactPhone || "").includes(search) || (row.contactTelegram || "").toLowerCase().includes(search))
    .map(conversationDto);
}

export async function getThread(id: string) {
  const conversation = conversationDto(await requireConversation(id));
  const rows = await db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, id)).orderBy(asc(chatMessages.createdAt));
  return { conversation, messages: rows.map(messageDto) };
}

export async function postReply(
  actorId: string | null,
  conversationId: string,
  body: string,
  clientId = crypto.randomUUID(),
  ip?: string,
): Promise<ChatMessageDto> {
  await requireConversation(conversationId);
  const existing = (await db.select().from(chatMessages).where(and(
    eq(chatMessages.conversationId, conversationId), eq(chatMessages.clientId, clientId),
  )).limit(1))[0];
  if (existing) return messageDto(existing);
  const [message] = await db.transaction(async (tx) => {
    const inserted = await tx.insert(chatMessages).values({
      conversationId, clientId, sender: "admin", authorUserId: actorId, body: body.trim(),
    }).returning();
    await tx.update(chatConversations).set({
      status: "open",
      unreadForVisitor: sql`${chatConversations.unreadForVisitor} + 1`,
      lastMessageAt: inserted[0].createdAt,
    }).where(eq(chatConversations.id, conversationId));
    await tx.insert(auditLogs).values({
      userId: actorId, action: "chat.reply.send", entityType: "chat_conversation",
      entityId: conversationId, details: { messageId: inserted[0].id }, ipAddress: ip || null,
    });
    return inserted;
  });
  return messageDto(message);
}

export async function updateConversation(actorId: string, input: ConversationPatchInput, ip?: string) {
  const previous = await requireConversation(input.conversationId);
  const patch = {
    status: input.status,
    assignedAdminId: input.assignToMe ? actorId : input.assignedAdminId,
    aiMode: input.aiMode,
  };
  const [updated] = await db.update(chatConversations).set(patch).where(eq(chatConversations.id, input.conversationId)).returning();
  await audit({
    actorId, action: input.aiMode ? "chat.ai_mode.update" : input.status ? "chat.conversation.status.update" : "chat.conversation.assign",
    conversationId: input.conversationId, ip,
    details: { previousStatus: previous.status, previousAiMode: previous.aiMode, next: patch },
  });
  return conversationDto(updated);
}

export async function approveDraft(actorId: string, conversationId: string, draftId: string, ip?: string) {
  const [draft] = await db.select().from(chatMessages).where(and(
    eq(chatMessages.id, draftId), eq(chatMessages.conversationId, conversationId), eq(chatMessages.sender, "ai"),
  )).limit(1);
  if (!draft || !draft.clientId.startsWith("draft:")) throw new ServiceError("NOT_FOUND", "AI qoralamasi topilmadi", 404);
  const reply = await postReply(actorId, conversationId, draft.body, crypto.randomUUID(), ip);
  await db.delete(chatMessages).where(eq(chatMessages.id, draftId));
  await audit({ actorId, action: "chat.draft.approve", conversationId, ip, details: { draftId, messageId: reply.id } });
  return reply;
}

export async function countAiRepliesSince(conversationId: string | null, since: Date) {
  const condition = conversationId
    ? and(eq(chatMessages.conversationId, conversationId), gte(chatMessages.createdAt, since))
    : gte(chatMessages.createdAt, since);
  const rows = await db.select({ id: chatMessages.id }).from(chatMessages).where(and(
    eq(chatMessages.sender, "ai"), notLike(chatMessages.clientId, "draft:%"), condition,
  ));
  return rows.length;
}
