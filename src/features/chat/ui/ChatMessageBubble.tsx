"use client";

import type { ChatMessageDto } from "../contracts";

function MessageText({ body }: { body: string }) {
  const parts = body.split(/(https?:\/\/[^\s]+)/g);
  return <p className="whitespace-pre-wrap break-words">{parts.map((part, index) => part.startsWith("http") ? <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer" className="underline underline-offset-2">{part}</a> : part)}</p>;
}

export function ChatMessageBubble({ message }: { message: ChatMessageDto }) {
  const visitor = message.sender === "visitor";
  const system = message.sender === "system";
  if (system) return <p className="mx-auto max-w-[90%] rounded-lg bg-accent-soft px-3 py-2 text-center text-sm text-ink-muted">{message.body}</p>;
  return (
    <div className={`chat-message flex ${visitor ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 ${visitor ? "rounded-br-sm bg-brand text-bg-elevated" : "rounded-bl-sm border border-border bg-bg-sunken text-ink"}`}>
        <MessageText body={message.body} />
        <p className="mt-1 text-xs opacity-70">
          {new Date(message.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
          {!visitor && message.sender !== "ai" ? message.readAt ? " · o'qildi" : " · yuborildi" : null}
        </p>
      </div>
    </div>
  );
}
