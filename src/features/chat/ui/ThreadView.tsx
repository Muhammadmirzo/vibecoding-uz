"use client";

import * as React from "react";
import { ArrowLeft, Bot, Check, CornerUpLeft, Link2, Send, UserRound, X } from "lucide-react";
import { aiModeSchema, chatMessageSchema, type ChatConversationDto, type ChatMessageDto } from "../contracts";
import { ChatMessageBubble } from "./ChatMessageBubble";

const AI_LABELS = { off: "O'chiq", assist: "Yordamchi", auto: "Avto" } as const;

export function ThreadView({
  conversation, messages, quickReplies, onRefresh, onBack,
}: {
  conversation: ChatConversationDto | null;
  messages: ChatMessageDto[];
  quickReplies: string[];
  onRefresh: () => Promise<void>;
  onBack: () => void;
}) {
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function patch(value: Record<string, unknown>) {
    if (!conversation) return;
    const response = await fetch("/api/v1/admin/chat/conversations", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id, ...value }),
    });
    if (!response.ok) setError("Amalni bajarishda xatolik berdi.");
    await onRefresh();
  }

  async function reply() {
    if (!conversation || !body.trim() || sending) return;
    setSending(true); setError(null);
    try {
      const response = await fetch("/api/v1/admin/chat/messages", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId: conversation.id, body, clientId: crypto.randomUUID() }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !payload || typeof payload !== "object" || !("data" in payload)) throw new Error("reply_failed");
      const message = chatMessageSchema.parse((payload as { data: { message: unknown } }).data.message);
      setBody(""); await onRefresh();
      void message;
    } catch { setError("Javob yuborilmadi. Matn saqlandi."); }
    finally { setSending(false); }
  }

  async function approve(draft: ChatMessageDto) {
    if (!conversation) return;
    const response = await fetch("/api/v1/admin/chat/drafts", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id, draftId: draft.id }),
    });
    if (!response.ok) setError("AI qoralamasi yuborilmadi.");
    await onRefresh();
  }

  if (!conversation) {
    return <div className="hidden min-h-[600px] place-items-center text-center lg:grid"><div><UserRound className="mx-auto size-10 text-ink-subtle" /><h2 className="mt-4 font-display text-xl font-semibold">Suhbatni tanlang</h2><p className="mt-2 text-ink-muted">Mehmon konteksti va javob shu yerda ko'rinadi.</p></div></div>;
  }

  return (
    <section className="flex min-h-[600px] min-w-0 flex-col">
      <header className="border-b border-border bg-bg-elevated p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onBack} aria-label="Ro'yxatga qaytish" className="grid size-11 place-items-center rounded-lg hover:bg-bg-sunken lg:hidden"><ArrowLeft className="size-5" /></button><div className="min-w-0"><h2 className="truncate font-display text-xl font-semibold text-ink">{conversation.displayName}</h2><p className="text-sm text-ink-muted">{conversation.unreadForAdmin > 0 ? `${conversation.unreadForAdmin} yangi xabar` : "Yangi xabar yo'q"}</p></div></div>
          <button type="button" onClick={() => void patch({ status: conversation.status === "closed" ? "open" : "closed" })} className="min-h-11 rounded-lg border border-border px-3 text-sm font-medium text-ink hover:bg-bg-sunken">{conversation.status === "closed" ? "Qayta ochish" : "Yopish"}</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-sm text-ink"><Bot className="size-4 text-brand" />AI<select value={conversation.aiMode} onChange={(event) => { const mode = aiModeSchema.safeParse(event.target.value); if (mode.success) void patch({ aiMode: mode.data }); }} className="bg-transparent font-medium outline-none">{Object.entries(AI_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <button type="button" onClick={() => void patch(conversation.assignedAdminId ? { assignedAdminId: null } : { assignToMe: true })} className="min-h-11 rounded-lg border border-border px-3 text-sm text-ink hover:bg-bg-sunken">{conversation.assignedAdminId ? "Biriktirilgan" : "Menga biriktirish"}</button>
        </div>
      </header>

      <details className="border-b border-border bg-bg-sunken/50 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-ink">Mehmon konteksti</summary>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
          <div><dt className="text-ink-subtle">Birinchi ko'rish</dt><dd className="mt-1 text-ink">{new Date(conversation.createdAt).toLocaleString("uz-UZ")}</dd></div>
          <div><dt className="text-ink-subtle">Sahifa</dt><dd className="mt-1 break-all text-ink">{conversation.sourcePath}</dd></div>
          <div><dt className="text-ink-subtle">Qurilma</dt><dd className="mt-1 break-all text-ink">{conversation.device}</dd></div>
          <div><dt className="text-ink-subtle">Aloqa</dt><dd className="mt-1 text-ink">{conversation.contactPhone || conversation.contactTelegram || "Kiritilmagan"}</dd></div>
          <div className="col-span-2 flex items-center gap-2 text-ink"><Link2 className="size-4 text-accent" />{conversation.leadId ? "Lead bilan bog'langan" : conversation.userId ? "Akount bilan bog'langan" : "Aloqa hali bog'lanmagan"}</div>
        </dl>
      </details>

      <div className="flex-1 space-y-3 overflow-y-auto bg-bg p-4" aria-live="polite">
        {messages.map((message) => message.isDraft ? <div key={message.id} className="rounded-xl border border-dashed border-brand/40 bg-brand-soft p-3"><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-brand"><Bot className="size-4" />AI qoralamasi</div><p className="whitespace-pre-wrap text-base text-ink">{message.body}</p><button type="button" onClick={() => void approve(message)} className="btn-press mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-gold px-4 text-sm font-semibold text-ink"><Send className="size-4" />Yuborish</button></div> : <ChatMessageBubble key={message.id} message={message} />)}
      </div>

      <footer className="border-t border-border bg-bg-elevated p-3">
        {quickReplies.length ? <div className="mb-2 flex gap-2 overflow-x-auto">{quickReplies.map((reply) => <button key={reply} type="button" onClick={() => setBody(reply)} className="min-h-11 shrink-0 rounded-full border border-border bg-bg-sunken px-3 text-sm text-ink">{reply}</button>)}</div> : null}
        {error ? <p role="alert" className="mb-2 text-sm text-danger">{error}</p> : null}
        <div className="flex items-end gap-2"><textarea value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); void reply(); } }} rows={2} maxLength={2000} placeholder="Javob yozing…" aria-label="Admin javobi" className="min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-border bg-bg px-3 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft" /><button type="button" onClick={() => void reply()} disabled={sending || !body.trim()} className="btn-press grid size-11 place-items-center rounded-xl bg-brand text-bg-elevated disabled:opacity-50" aria-label="Javobni yuborish"><Send className="size-5" /></button></div>
        <p className="mt-2 flex items-center gap-1 text-xs text-ink-subtle"><CornerUpLeft className="size-3" />Ctrl + Enter yuborish uchun</p>
      </footer>
    </section>
  );
}
