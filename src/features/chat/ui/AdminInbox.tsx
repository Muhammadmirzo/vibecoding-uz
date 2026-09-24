"use client";

import * as React from "react";
import { z } from "zod";
import { adminThreadSchema, chatConversationSchema, chatSettingsSchema, type ChatConversationDto } from "../contracts";
import { ConversationList } from "./ConversationList";
import { ThreadView } from "./ThreadView";

const conversationListSchema = z.object({ conversations: z.array(chatConversationSchema) });
const bootstrapSchema = z.object({ data: z.object({ settings: chatSettingsSchema }) });

export function AdminInbox({ initialConversationId }: { initialConversationId?: string }) {
  const [rows, setRows] = React.useState<ChatConversationDto[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | undefined>(initialConversationId);
  const [thread, setThread] = React.useState<Awaited<ReturnType<typeof loadThread>> | null>(null);
  const [filter, setFilter] = React.useState("open");
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [quickReplies, setQuickReplies] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const loadList = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/admin/chat/conversations?status=${encodeURIComponent(filter)}&q=${encodeURIComponent(debouncedQuery)}`);
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error("list_failed");
      setRows(conversationListSchema.parse((payload as { data: unknown }).data).conversations);
      setError(null);
    } catch { setError("Inboxni yangilab bo'lmadi. Qayta urinish uchun sahifani yangilang."); }
    finally { setLoading(false); }
  }, [debouncedQuery, filter]);

  const loadThread = React.useCallback(async (id?: string) => {
    if (!id) return null;
    const response = await fetch(`/api/v1/admin/chat/conversations?id=${encodeURIComponent(id)}`);
    const payload: unknown = await response.json();
    if (!response.ok) throw new Error("thread_failed");
    return adminThreadSchema.parse((payload as { data: unknown }).data);
  }, []);

  React.useEffect(() => {
    void loadList();
    const timer = window.setInterval(() => void loadList(), 5_000);
    return () => window.clearInterval(timer);
  }, [loadList]);

  React.useEffect(() => {
    if (!selectedId) { setThread(null); return; }
    void fetch("/api/v1/admin/chat/read", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId }),
    }).catch(() => undefined);
    let active = true;
    const refresh = async () => {
      try { const value = await loadThread(selectedId); if (active) setThread(value); }
      catch { if (active) setError("Suhbatni yuklashda xatolik berdi."); }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [loadThread, selectedId]);

  React.useEffect(() => {
    void fetch("/api/v1/chat").then((response) => response.json()).then((payload: unknown) => {
      const parsed = bootstrapSchema.safeParse(payload);
      if (parsed.success) setQuickReplies(parsed.data.data.settings.quickReplies);
    }).catch(() => undefined);
  }, []);

  const refreshThread = React.useCallback(async () => {
    if (!selectedId) return;
    const value = await loadThread(selectedId);
    setThread(value);
    await loadList();
  }, [loadList, loadThread, selectedId]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm font-semibold text-accent">Jonli muloqot</p><h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">Chat inbox</h1><p className="mt-2 text-ink-muted">Mehmon konteksti, AI qoralamalari va javoblar bir joyda.</p></div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-2 text-sm text-ink-muted"><span className="size-2 rounded-full bg-success" />5 soniyada yangilanadi</div>
      </header>
      {error ? <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p> : null}
      <div className="grid min-h-[600px] overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className={selectedId ? "hidden lg:block" : "block"}><ConversationList rows={rows} selectedId={selectedId} filter={filter} query={query} loading={loading} onFilter={setFilter} onQuery={setQuery} onSelect={setSelectedId} /></div>
        <div className={selectedId ? "block" : "hidden lg:block"}><ThreadView conversation={thread?.conversation || null} messages={thread?.messages || []} quickReplies={quickReplies} onRefresh={refreshThread} onBack={() => setSelectedId(undefined)} /></div>
      </div>
    </div>
  );
}
