"use client";

import * as React from "react";
import type { ChatConversationDto } from "../contracts";

const Panel = React.lazy(() => import("./ChatPanel"));
const CHAT_SEEN_KEY = "naqsh-chat-seen";

export function ChatLauncher() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [hasConversation, setHasConversation] = React.useState(false);
  const [unread, setUnread] = React.useState(0);
  const launcherRef = React.useRef<HTMLButtonElement>(null);
  const hoverTimer = React.useRef<number | null>(null);

  const show = React.useCallback((analytics = true) => {
    setOpen(true);
    setUnread(0);
    if (analytics) void fetch("/api/v1/chat/open", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ sourcePath: window.location.pathname }),
    }).catch(() => undefined);
  }, []);

  React.useEffect(() => {
    setMounted(true);
    const openFromLink = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-chat-open]")) {
        event.preventDefault();
        show();
      }
    };
    const openFromHash = () => {
      if (window.location.hash === "#chat") {
        show();
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
    };
    document.addEventListener("click", openFromLink);
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
    return () => {
      document.removeEventListener("click", openFromLink);
      window.removeEventListener("hashchange", openFromHash);
      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    };
  }, [show]);

  React.useEffect(() => {
    if (!mounted || window.location.pathname.startsWith("/admin")) return;
    // Only visitors who have opened the chat before poll for unread replies —
    // everyone else costs zero requests (and gets no chat cookie).
    if (open) { try { localStorage.setItem(CHAT_SEEN_KEY, "1"); } catch { /* storage blocked */ } }
    let seen = false;
    try { seen = localStorage.getItem(CHAT_SEEN_KEY) === "1"; } catch { /* storage blocked */ }
    if (!seen && !open) return;
    let active = true;
    const check = async () => {
      try {
        const response = await fetch("/api/v1/chat", { credentials: "same-origin" });
        const payload: unknown = await response.json();
        if (!active || !response.ok || !payload || typeof payload !== "object" || !("data" in payload)) return;
        const data = (payload as { data: { conversation?: ChatConversationDto | null } }).data;
        setHasConversation(Boolean(data.conversation));
        if (!open) setUnread(data.conversation?.unreadForVisitor || 0);
      } catch { /* launcher remains quiet when chat is unavailable */ }
    };
    void check();
    const timer = window.setInterval(check, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [mounted, open]);

  if (!mounted || window.location.pathname.startsWith("/admin")) return null;

  const close = () => {
    setOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  };
  const onPointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse") return;
    hoverTimer.current = window.setTimeout(() => {
      void import("./ChatPanel");
      show(false);
    }, 350);
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => show()}
        onPointerEnter={onPointerEnter}
        onPointerLeave={() => { if (hoverTimer.current) window.clearTimeout(hoverTimer.current); }}
        data-chat-launcher
        aria-label="Naqsh bilan suhbatlashish"
        className="fixed bottom-[max(5.75rem,calc(env(safe-area-inset-bottom)+1rem))] right-4 z-40 grid size-14 place-items-center rounded-full border border-border bg-brand text-bg-elevated shadow-lg transition duration-fast ease-spring hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg lg:bottom-6"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A7 7 0 0 1 3 13V8a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4Z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" strokeLinecap="round" />
        </svg>
        {unread > 0 ? <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-bold text-on-gold">{unread > 9 ? "9+" : unread}</span> : null}
      </button>
      {open ? (
        <React.Suspense fallback={<div className="sr-only" role="status">Chat yuklanmoqda…</div>}>
          <Panel close={close} onConversationChange={setHasConversation} />
        </React.Suspense>
      ) : null}
    </>
  );
}
