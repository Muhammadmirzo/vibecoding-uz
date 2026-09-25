import { describe, expect, it } from "vitest";
import { usesTransactionPooler } from "@/db";
import { messageDto } from "@/features/chat/server/chat-dto";

describe("database pooler detection", () => {
  // Regression: prepared statements through Supabase's transaction pooler silently lost
  // concurrent chat writes (3 of 12 Telegram replies stored in a local PgBouncer repro).
  it("disables prepared statements for the transaction pooler", () => {
    expect(usesTransactionPooler("postgresql://u:p@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres")).toBe(true);
    expect(usesTransactionPooler("postgresql://u:p@host:5432/db?pgbouncer=true")).toBe(true);
  });

  it("keeps them for direct and session connections", () => {
    expect(usesTransactionPooler("postgresql://u:p@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres")).toBe(false);
    expect(usesTransactionPooler("not a url")).toBe(false);
  });
});

describe("chat message reply quote", () => {
  const base = {
    conversationId: "11111111-1111-4111-8111-111111111111", sender: "admin", authorUserId: null,
    telegramMessageId: null, createdAt: new Date(), readAt: null, replyToId: null,
  };
  const parent = { ...base, id: "22222222-2222-4222-8222-222222222222", clientId: "c1", sender: "visitor", body: "x".repeat(400) };
  const reply = { ...base, id: "33333333-3333-4333-8333-333333333333", clientId: "telegram-1", body: "Javob", replyToId: parent.id };

  it("quotes the answered message, shortened", () => {
    const dto = messageDto(reply, parent);
    expect(dto.replyTo).toMatchObject({ id: parent.id, sender: "visitor" });
    expect(dto.replyTo?.body.length).toBe(160);
  });

  it("is null for ordinary messages", () => {
    expect(messageDto(parent).replyTo).toBeNull();
  });
});
