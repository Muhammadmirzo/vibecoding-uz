"use client";

import * as React from "react";
import { Bot, Send, VolumeX, WifiOff, X } from "lucide-react";
import { isOfficeOpen } from "../domain/office-hours";
import type { ChatConversationDto, ChatMessageDto, ChatSettingsInput, SendMessageInput } from "../contracts";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { OfflineLeadForm, type OfflineLeadValues } from "./OfflineLeadForm";
import { httpChatTransport, type ChatTransport } from "./transport";

const POLL_VISIBLE = 3_000;
const POLL_HIDDEN = 20_000;
const MAX_BACKOFF = 60_000;

function mergeMessages(current: ChatMessageDto[], incoming: ChatMessageDto[]) {
  const map = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => map.set(message.id, message));
  return [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export default function ChatPanel({
  close,
  onConversationChange,
  transport = httpChatTransport,
}: {
  close: () => void;
  onConversationChange: (exists: boolean) => void;
  transport?: ChatTransport;
}) {
  const [settings, setSettings] = React.useState<ChatSettingsInput | null>(null);
  const [conversation, setConversation] = React.useState<ChatConversationDto | null>(null);
  const [messages, setMessages] = React.useState<ChatMessageDto[]>([]);
  const [body, setBody] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [apiDown, setApiDown] = React.useState(false);
  const [hasStickyBar, setHasStickyBar] = React.useState(false);
  const dialogRef = React.useRef<HTMLElement>(null);
  const composerRef = React.useRef<HTMLTextAreaElement>(null);
  const cursorRef = React.useRef<string | undefined>();
  const failuresRef = React.useRef(0);
  const pendingRef = React.useRef<{ body: string; clientId: string } | null>(null);

  React.useEffect(() => {
    setHasStickyBar(Boolean(document.querySelector("[data-sticky-buy-bar]")));
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    composerRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  React.useEffect(() => {
    let stopped = false;
    let timer = 0;
    const poll = async () => {
      if (stopped) return;
      try {
        const response = await transport.messages(cursorRef.current);
        if (stopped) return;
        failuresRef.current = 0;
        setApiDown(false);
        setConversation(response.conversation);
        onConversationChange(Boolean(response.conversation));
        setMessages((current) => mergeMessages(current, response.messages));
        cursorRef.current = response.nextCursor || cursorRef.current;
        if (response.messages.some((message) => message.sender !== "visitor" && !message.readAt)) {
          void transport.markRead();
          const now = new Date().toISOString();
          setMessages((current) => current.map((message) => message.sender !== "visitor" && !message.readAt ? { ...message, readAt: now } : message));
        }
      } catch {
        failuresRef.current += 1;
        setApiDown(true);
      } finally {
        if (!stopped) {
          const base = document.visibilityState === "visible" ? POLL_VISIBLE : POLL_HIDDEN;
          const delay = Math.min(MAX_BACKOFF, base * 2 ** Math.min(failuresRef.current, 4));
          timer = window.setTimeout(poll, delay);
        }
      }
    };
    void transport.bootstrap().then((data) => {
      if (stopped) return;
      setSettings(data.settings);
      setConversation(data.conversation);
      onConversationChange(Boolean(data.conversation));
      if (!data.settings.enabled) setError("Chat vaqtincha yopilgan.");
    }).catch(() => setApiDown(true));
    void poll();
    return () => { stopped = true; window.clearTimeout(timer); };
  }, [onConversationChange, transport]);

  React.useEffect(() => {
    const list = dialogRef.current?.querySelector<HTMLElement>("[data-message-list]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list?.scrollTo({ top: list.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages.length, typing]);

  async function sendMessage(value = body, contact?: OfflineLeadValues) {
    const trimmed = value.trim();
    if (!trimmed || sending) return false;
    setSending(true); setError(null);
    // A retry of the same text keeps its clientId, so a send that reached the server
    // before the network failed is not stored twice.
    if (pendingRef.current?.body !== trimmed) pendingRef.current = { body: trimmed, clientId: crypto.randomUUID() };
    const input: SendMessageInput = {
      clientId: pendingRef.current.clientId, body: trimmed, sourcePath: window.location.pathname,
      device: navigator.userAgent.slice(0, 120), ...contact,
    };
    try {
      const message = await transport.send(input);
      pendingRef.current = null;
      setMessages((current) => mergeMessages(current, [message]));
      setBody(""); setApiDown(false);
      if (conversation?.aiMode && conversation.aiMode !== "off") {
        setTyping(true);
        window.setTimeout(() => setTyping(false), 8_000);
      }
      return true;
    } catch {
      setError("Xabar yuborilmadi. Matn saqlandi — qayta urinib ko'ring.");
      setApiDown(true);
      return false;
    } finally { setSending(false); }
  }

  async function sendOffline(values: OfflineLeadValues) {
    await sendMessage(body.trim() || "Hozir oflaynmiz. Telegram orqali bog'laning.", values);
  }

  const officeOpen = settings ? isOfficeOpen(new Date(), settings.officeHours) : false;
  const panelPosition = hasStickyBar
    ? "bottom-[calc(5.75rem+env(safe-area-inset-bottom))] h-[calc(100dvh-6.5rem-env(safe-area-inset-bottom))]"
    : "bottom-0 h-[100dvh] sm:bottom-6 sm:h-[min(680px,calc(100dvh-3rem))]";

  return (
    <section className="fixed inset-0 z-[60] flex items-end justify-end bg-ink/40 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="chat-title" className={`flex w-full flex-col overflow-hidden border border-border bg-bg-elevated shadow-lg sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100dvh-3rem))] sm:w-[410px] sm:rounded-2xl ${panelPosition}`}>
        <header className="flex items-center justify-between bg-brand px-4 py-4 text-bg-elevated">
          <div><h2 id="chat-title" className="font-display text-lg font-semibold">Naqsh bilan suhbat</h2><p className="mt-0.5 text-sm opacity-80">{officeOpen ? `Odatda ${settings?.replyTimeMinutes || 10} daqiqada javob beramiz` : "Hozir oflaynmiz — xabar qoldiring"}</p></div>
          <button type="button" onClick={close} aria-label="Chatni yopish" className="grid size-11 place-items-center rounded-lg hover:bg-bg-elevated/10"><X className="size-5" /></button>
        </header>
        <div data-message-list className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
          {settings ? <p className="rounded-xl border border-accent/20 bg-accent-soft p-3 text-sm leading-6 text-ink">{settings.welcomeText}</p> : null}
          {settings?.quickReplies.map((reply) => <button key={reply} type="button" onClick={() => setBody(reply)} className="min-h-11 rounded-full border border-brand/20 bg-brand-soft px-4 text-left text-base text-brand hover:bg-brand-soft/70">{reply}</button>)}
          {messages.map((message) => <ChatMessageBubble key={message.id} message={message} />)}
          {typing ? <div className="flex items-center gap-2 text-sm text-ink-muted" role="status"><Bot className="size-4" /><span className="flex gap-1"><i className="chat-dot" /><i className="chat-dot" /><i className="chat-dot" /></span>Yordamchi javob tayyorlanmoqda…</div> : null}
        </div>
        {error ? <div role="alert" className="mx-4 mb-2 flex items-start gap-2 rounded-lg bg-danger-soft p-3 text-sm text-danger"><WifiOff className="mt-0.5 size-4 shrink-0" /><span className="flex-1">{error}</span>{body ? <button type="button" onClick={() => void sendMessage()} className="font-semibold underline">Qayta yuborish</button> : null}</div> : null}
        {settings && !officeOpen ? <OfflineLeadForm offlineText={settings.offlineText} body={body} sending={sending} onBodyChange={setBody} onSubmit={sendOffline} /> : null}
        {!settings || officeOpen ? <div className="border-t border-border bg-bg-elevated p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mb-2 flex items-center justify-between text-xs text-ink-muted"><span>Ovoz o&apos;chirilgan</span><span className="inline-flex items-center gap-1"><VolumeX className="size-3" /> Xavfsiz chat</span></div>
          <div className="flex items-end gap-2">
            <textarea ref={composerRef} value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={2} maxLength={2000} placeholder="Xabaringizni yozing…" aria-label="Chat xabari" className="min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-border bg-bg px-3 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft" />
            <button type="button" disabled={sending || !body.trim()} onClick={() => void sendMessage()} aria-label="Xabarni yuborish" className="btn-press grid size-11 shrink-0 place-items-center rounded-xl bg-gold text-ink disabled:opacity-50"><Send className="size-5" /></button>
          </div>
        </div> : null}
      </section>
    </section>
  );
}
