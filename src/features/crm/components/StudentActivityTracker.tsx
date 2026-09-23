"use client";
import { useState } from "react";
import { CheckCircle2, RefreshCw, Users, X } from "lucide-react";
import { ActivityDetailModal } from "./Activity/ActivityDetailModal";
import { ActivityFilters } from "./Activity/ActivityFilters";
import { ActivitySummaryCards } from "./Activity/ActivitySummaryCards";
import { ActivityTable } from "./Activity/ActivityTable";
import { useActivity } from "./Activity/useActivity";
import type { StudentActivityItem } from "./Activity/types";
export type { StudentActivityItem, ActivityKpis } from "./Activity/types";
export function StudentActivityTracker() { const data = useActivity(); const [selected, setSelected] = useState<StudentActivityItem | null>(null); const [toast, setToast] = useState<string | null>(null); const reminder = (student: StudentActivityItem) => { setToast(`${student.fullName} ga Telegram/SMS eslatmasi yuborildi!`); window.setTimeout(() => setToast(null), 3500); };
  return <div className="space-y-6"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2"><Users className="w-6 h-6 text-accent" />Talabalar Faolligi &amp; O&apos;zlashtirish Monitoringi</h1><p className="text-sm text-ink-muted mt-1">Guruhlar va talabalarning dars progressi, oxirgi online vaqti, uy vazifalari va quiz natijalarini real-vaqtda kuzatish.</p></div><button onClick={() => void data.fetchStudentActivity()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cream-warm border border-border text-xs font-semibold text-ink hover:bg-cream-deep transition-colors self-start md:self-auto"><RefreshCw className={`w-4 h-4 text-accent ${data.loading ? "animate-spin" : ""}`} /><span>Yangilash</span></button></div>
    {toast ? <div className="p-3.5 rounded-xl bg-success-soft border border-success/30 text-success text-xs font-semibold flex items-center justify-between shadow-sm"><div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /><span>{toast}</span></div><button onClick={() => setToast(null)} className="text-success hover:opacity-80"><X className="w-4 h-4" /></button></div> : null}<ActivitySummaryCards kpis={data.kpis} /><ActivityFilters search={data.search} setSearch={data.setSearch} statusFilter={data.statusFilter} setStatusFilter={data.setStatusFilter} /><ActivityTable students={data.students} loading={data.loading} onSelect={setSelected} onReminder={reminder} />{selected ? <ActivityDetailModal student={selected} onClose={() => setSelected(null)} onReminder={reminder} /> : null}
  </div>;
}
