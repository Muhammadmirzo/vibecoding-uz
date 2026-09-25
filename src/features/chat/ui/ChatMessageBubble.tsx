"use client";

import type { ChatMessageDto } from "../contracts";

function MessageText({ body }: { body: string }) {
  const parts = body.split(/(https?:\/\/[^\s]+)/g);
  return <p className="whitespace-pre-wrap break-words">{parts.map((part, index) => part.startsWith("http") ? <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer" className="underline underline-offset-2">{part}</a> : part)}</p>;
}

const SENDER_LABEL = {
  visitor: { visitor: "Siz", admin: "Mehmon" },
  admin: { visitor: "Naqsh", admin: "Admin" },
  ai: { visitor: "Yordamchi", admin: "AI" },
  system: { visitor: "Tizim", admin: "Tizim" },
} as const;

function jumpTo(id: string) {
  const target = document.getElementById(`chat-msg-${id}`);
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  target.classList.add("chat-message-flash");
  window.setTimeout(() => target.classList.remove("chat-message-flash"), 1_200);
}

export function ChatMessageBubble({ message, viewer = "visitor" }: { message: ChatMessageDto; viewer?: "visitor" | "admin" }) {
  const visitor = message.sender === "visitor";
  const system = message.sender === "system";
  if (system) return <p className="mx-auto max-w-[90%] rounded-lg bg-accent-soft px-3 py-2 text-center text-sm text-ink-muted">{message.body}</p>;
  const quote = message.replyTo;
  return (
    <div id={`chat-msg-${message.id}`} className={`chat-message flex ${visitor ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${visitor ? "rounded-br-sm bg-brand text-bg-elevated" : "rounded-bl-sm border border-border bg-bg-sunken text-ink"}`}>
        {quote ? (
          <button type="button" onClick={() => jumpTo(quote.id)} aria-label={`Javob: ${quote.body}`} className="mb-1.5 block w-full min-w-0 rounded-lg border-l-2 border-brand bg-bg-elevated px-2.5 py-1.5 text-left text-sm text-ink-muted hover:bg-brand-soft">
            <span className="block text-xs font-semibold text-brand">{SENDER_LABEL[quote.sender][viewer]}</span>
            <span className="line-clamp-2 break-words">{quote.body}</span>
          </button>
        ) : null}
        <MessageText body={message.body} />
        <p className="mt-1 text-xs opacity-70">
          {new Date(message.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
          {!visitor && message.sender !== "ai" ? message.readAt ? " · o'qildi" : " · yuborildi" : null}
        </p>
      </div>
    </div>
  );
}
