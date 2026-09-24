import { chatConversations, chatMessages } from "@/db/schema";
import { chatConversationSchema, chatMessageSchema, type ChatConversationDto, type ChatMessageDto } from "../contracts";

type ConversationRow = typeof chatConversations.$inferSelect;
type MessageRow = typeof chatMessages.$inferSelect;

export function conversationDto(row: ConversationRow): ChatConversationDto {
  return chatConversationSchema.parse({
    id: row.id,
    displayName: row.displayName,
    status: row.status,
    aiMode: row.aiMode,
    assignedAdminId: row.assignedAdminId,
    userId: row.userId,
    leadId: row.leadId,
    lastMessageAt: row.lastMessageAt.toISOString(),
    unreadForAdmin: row.unreadForAdmin,
    unreadForVisitor: row.unreadForVisitor,
    sourcePath: row.sourcePath,
    device: row.device,
    contactPhone: row.contactPhone,
    contactTelegram: row.contactTelegram,
    createdAt: row.createdAt.toISOString(),
  });
}

export function messageDto(row: MessageRow): ChatMessageDto {
  return chatMessageSchema.parse({
    id: row.id,
    conversationId: row.conversationId,
    clientId: row.clientId,
    sender: row.sender,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt?.toISOString() ?? null,
    isDraft: row.clientId.startsWith("draft:"),
  });
}
