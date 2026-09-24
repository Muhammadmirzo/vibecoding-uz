import { and, asc, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { chatConversations, chatMessages } from "@/db/schema";
import { chatSettingsSchema, type ChatConversationDto, type ChatMessageDto, type SendMessageInput, type ChatSettingsInput } from "../contracts";
import { hashVisitorToken } from "./visitor-token";
import { ServiceError } from "@/lib/http/errors";
import { getChatSettings } from "./settings.service";

function dtoConversation(row: typeof chatConversations.$inferSelect): ChatConversationDto { return { id: row.id, displayName: row.displayName, status: row.status as ChatConversationDto["status"], aiMode: row.aiMode as ChatConversationDto["aiMode"], lastMessageAt: row.lastMessageAt.toISOString(), unreadForAdmin: row.unreadForAdmin, unreadForVisitor: row.unreadForVisitor, sourcePath: row.sourcePath, device: row.device, contactPhone: row.contactPhone, contactTelegram: row.contactTelegram }; }
function dtoMessage(row: typeof chatMessages.$inferSelect): ChatMessageDto { return { id: row.id, conversationId: row.conversationId, clientId: row.clientId, sender: row.sender as ChatMessageDto["sender"], body: row.body, createdAt: row.createdAt.toISOString(), readAt: row.readAt?.toISOString() ?? null }; }

export async function getVisitorConversation(token: string): Promise<ChatConversationDto | null> { const rows = await db.select().from(chatConversations).where(eq(chatConversations.visitorTokenHash, hashVisitorToken(token))).limit(1); return rows[0] ? dtoConversation(rows[0]) : null; }
export async function listMessages(token: string, after?: string): Promise<ChatMessageDto[]> { const conversation = await db.select({ id: chatConversations.id }).from(chatConversations).where(eq(chatConversations.visitorTokenHash, hashVisitorToken(token))).limit(1); if (!conversation[0]) return []; const rows = await db.select().from(chatMessages).where(and(eq(chatMessages.conversationId, conversation[0].id), after ? gt(chatMessages.createdAt, new Date(after)) : undefined)).orderBy(asc(chatMessages.createdAt)); return rows.map(dtoMessage); }
export async function sendVisitorMessage(token: string, input: SendMessageInput): Promise<ChatMessageDto> {
  const tokenHash = hashVisitorToken(token);
  const existing = await db.select().from(chatConversations).where(eq(chatConversations.visitorTokenHash, tokenHash)).limit(1);
  let conversationId = existing[0]?.id;
  if (!conversationId) { const settings = await getChatSettings(); const [created] = await db.insert(chatConversations).values({ visitorTokenHash: tokenHash, displayName: input.name || "Mehmon", contactPhone: input.phone, contactTelegram: input.telegram, sourcePath: input.sourcePath, device: input.device, aiMode: settings.aiDefaultMode }).returning(); conversationId = created.id; }
  const duplicate = await db.select().from(chatMessages).where(and(eq(chatMessages.conversationId, conversationId), eq(chatMessages.clientId, input.clientId))).limit(1);
  if (duplicate[0]) return dtoMessage(duplicate[0]);
  const [message] = await db.insert(chatMessages).values({ conversationId, clientId: input.clientId, sender: "visitor", body: input.body }).returning();
  await db.update(chatConversations).set({ unreadForAdmin: 1, unreadForVisitor: 0, lastMessageAt: message.createdAt, displayName: input.name || undefined }).where(eq(chatConversations.id, conversationId));
  return dtoMessage(message);
}
export async function listConversations(filter = "open", q = ""): Promise<ChatConversationDto[]> { const query = q.trim().toLowerCase(); const rows = await db.select().from(chatConversations).orderBy(desc(chatConversations.lastMessageAt)); return rows.filter((row) => filter === "assigned" ? Boolean(row.assignedAdminId) : filter === "all" || row.status === filter).filter((row) => !query || row.displayName.toLowerCase().includes(query) || (row.contactPhone || "").includes(query)).map(dtoConversation); }
export async function getThread(id: string): Promise<{ conversation: ChatConversationDto; messages: ChatMessageDto[] }> { const rows = await db.select().from(chatConversations).where(eq(chatConversations.id, id)).limit(1); if (!rows[0]) throw new ServiceError("NOT_FOUND", "Suhbat topilmadi", 404); return { conversation: dtoConversation(rows[0]), messages: (await db.select().from(chatMessages).where(eq(chatMessages.conversationId, id)).orderBy(asc(chatMessages.createdAt))).map(dtoMessage) }; }
export async function postReply(actor: string, conversationId: string, body: string, clientId = crypto.randomUUID()): Promise<ChatMessageDto> { const [message] = await db.insert(chatMessages).values({ conversationId, clientId, sender: "admin", authorUserId: actor, body: body.trim().slice(0, 2000) }).returning(); await db.update(chatConversations).set({ unreadForVisitor: 1, lastMessageAt: message.createdAt, status: "open" }).where(eq(chatConversations.id, conversationId)); return dtoMessage(message); }
export type { ChatSettingsInput };
