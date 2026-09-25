"use client";

import { MessageCircle, Search } from "lucide-react";
import type { ChatConversationDto } from "../contracts";

const FILTERS = [
  ["open", "Ochiq"], ["pending", "Javob kutmoqda"], ["closed", "Yopilgan"], ["assigned", "Menga biriktirilgan"],
] as const;

export function ConversationList({
  rows, selectedId, filter, query, loading, onFilter, onQuery, onSelect,
}: {
  rows: ChatConversationDto[];
  selectedId?: string;
  filter: string;
  query: string;
  loading: boolean;
  onFilter: (value: string) => void;
  onQuery: (value: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="min-w-0 border-b border-border lg:border-b-0 lg:border-r">
      <div className="space-y-3 border-b border-border p-3">
        <label className="relative block">
          <span className="sr-only">Suhbatlarda qidirish</span>
          <Search className="absolute left-3 top-3.5 size-4 text-ink-muted" />
          <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Ism, telefon yoki Telegram" className="min-h-11 w-full rounded-lg border border-border bg-bg pl-9 pr-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft" />
        </label>
        <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Suhbat filtlari">
          {FILTERS.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => onFilter(value)} className={`min-h-11 shrink-0 rounded-lg px-3 text-sm font-medium ${filter === value ? "bg-brand text-bg-elevated" : "bg-bg-sunken text-ink-muted hover:text-ink"}`}>{label}</button>)}
        </div>
      </div>
      <div className="max-h-[34rem] overflow-y-auto p-2 lg:max-h-[680px]" aria-busy={loading}>
        {rows.map((row) => <button key={row.id} type="button" onClick={() => onSelect(row.id)} className={`mb-1 w-full rounded-xl border p-3 text-left transition-colors ${selectedId === row.id ? "border-brand/30 bg-brand-soft" : "border-transparent hover:bg-bg-sunken"}`}>
          <div className="flex items-center justify-between gap-2"><strong className="truncate text-base text-ink">{row.displayName}</strong>{row.unreadForAdmin > 0 ? <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-bold text-on-gold">{row.unreadForAdmin}</span> : null}</div>
          <p className="mt-1 truncate text-sm text-ink-muted">{row.sourcePath}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-subtle"><span>{row.status === "pending" ? "Javob kutilmoqda" : row.status === "closed" ? "Yopilgan" : "Ochiq"}</span><time>{new Date(row.lastMessageAt).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time></div>
        </button>)}
        {!loading && rows.length === 0 ? <div className="px-4 py-12 text-center"><MessageCircle className="mx-auto size-8 text-ink-subtle" /><p className="mt-3 text-sm text-ink-muted">Bu filtrda suhbat yo'q.</p></div> : null}
      </div>
    </aside>
  );
}
