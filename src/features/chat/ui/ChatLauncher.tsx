"use client";
import * as React from "react";
import { MessageCircle, X, Send, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

const Panel = React.lazy(() => import("./ChatPanel"));
export function ChatLauncher() {
  const [open, setOpen] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [unread, setUnread] = React.useState(0);
  React.useEffect(() => { if (window.location.pathname.startsWith("/admin")) return; const openHash = () => { if (window.location.hash === "#chat" || document.querySelector("[data-chat-open]")?.matches(":hover")) setOpen(true); }; window.addEventListener("hashchange", openHash); openHash(); const poll = window.setInterval(async () => { try { const r = await fetch("/api/v1/chat"); const j = await r.json() as { data?: { conversation?: { unreadForVisitor?: number } } }; if (!open) setUnread(j.data?.conversation?.unreadForVisitor || 0); } catch { /* degraded */ } }, 60_000); return () => { window.removeEventListener("hashchange", openHash); clearInterval(poll); }; }, [open]);
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) return null;
  const show = () => { if (!loaded) void import("./ChatPanel").then(() => setLoaded(true)); setOpen(true); };
  return <><button type="button" onClick={show} onMouseEnter={show} data-chat-launcher aria-label="Chatni ochish" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 grid size-14 place-items-center rounded-full bg-brand text-white shadow-xl transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:bottom-6 sm:right-6"><MessageCircle className="size-6" />{unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-bold text-ink">{unread > 9 ? "9+" : unread}</span>}</button>{open && <React.Suspense fallback={<div className="sr-only">Chat yuklanmoqda…</div>}><Panel close={() => setOpen(false)} /></React.Suspense>}</>;
}
