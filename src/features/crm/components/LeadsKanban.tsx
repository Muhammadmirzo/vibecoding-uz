"use client";

import { Filter, Loader2, Plus, Search, X } from "lucide-react";
import { useKanban } from "./Leads/useKanban";
import { KanbanBoard } from "./Leads/KanbanBoard";
import { LeadModal } from "./Leads/LeadModal";
import type { LeadStatus } from "./Leads/types";

export function LeadsKanban() {
  const board = useKanban();
  const dragStart = (event: React.DragEvent, id: string) => { event.dataTransfer.setData("text/plain", id); board.setDraggedLeadId(id); };
  const drop = async (event: React.DragEvent, status: LeadStatus) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain") || board.draggedLeadId; if (id) await board.moveStatus(id, status); board.setDraggedLeadId(null); };
  const openCreate = () => { board.setEditingLead(null); board.setIsModalOpen(true); };
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="font-display text-2xl font-semibold text-ink">Leadlar va ishlab chiqarish</h1><p className="mt-1 text-sm text-ink-muted">Leadlarni bosqichlar orqali boshqaring. Telefonda holatni menyudan tanlang.</p></div>
        <button type="button" onClick={openCreate} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-ink shadow-sm hover:bg-gold/90"><Plus className="h-4 w-4" />Yangi lead</button>
      </header>
      <div className="grid gap-3 rounded-2xl border border-border bg-bg-elevated p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" /><label className="sr-only" htmlFor="lead-search">Leadlarni qidirish</label><input id="lead-search" type="search" placeholder="Ism yoki telefon raqami" value={board.searchQuery} onChange={(event) => board.setSearchQuery(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-bg pl-10 pr-4 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" /></div>
        <div className="relative"><Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" /><label className="sr-only" htmlFor="lead-source">Manba</label><select id="lead-source" value={board.sourceFilter} onChange={(event) => board.setSourceFilter(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-bg pl-10 pr-4 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-52"><option value="all">Barcha manbalar</option><option value="quiz">Diagnostika quiz</option><option value="free_lesson">Bepul dars</option><option value="form">Sayt formasi</option><option value="telegram">Telegram</option><option value="manual">Qo&apos;lda</option></select></div>
      </div>
      {board.loading ? <div role="status" className="grid min-h-64 place-items-center rounded-2xl border border-border bg-bg-elevated"><div className="text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-brand" /><p className="mt-3 text-sm text-ink-muted">Leadlar yuklanmoqda...</p></div></div> : <KanbanBoard leads={board.leads} draggedLeadId={board.draggedLeadId} onDragStart={dragStart} onDragOver={(event) => event.preventDefault()} onDrop={drop} onEdit={(lead) => { board.setEditingLead(lead); board.setIsModalOpen(true); }} onDelete={board.deleteLead} onMove={board.moveStatus} onQuiz={board.setQuizDetailsLead} />}
      {board.quizDetailsLead && <div role="dialog" aria-modal="true" aria-labelledby="quiz-title" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm"><div className="my-auto max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-xl"><div className="flex items-center justify-between border-b border-border p-5"><h2 id="quiz-title" className="text-lg font-semibold text-ink">Diagnostika natijalari: {board.quizDetailsLead.name}</h2><button type="button" onClick={() => board.setQuizDetailsLead(null)} className="grid h-11 w-11 place-items-center rounded-lg text-ink-muted hover:bg-bg-sunken" aria-label="Yopish"><X className="h-5 w-5" /></button></div><pre className="max-h-[60dvh] overflow-auto whitespace-pre-wrap break-words bg-bg-sunken p-4 font-mono text-xs text-ink">{JSON.stringify(board.quizDetailsLead.quizAnswers, null, 2)}</pre><div className="flex justify-end border-t border-border p-4"><button type="button" onClick={() => board.setQuizDetailsLead(null)} className="min-h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-bg-elevated">Yopish</button></div></div></div>}
      <LeadModal isOpen={board.isModalOpen} onClose={() => board.setIsModalOpen(false)} onSave={board.saveLead} initialData={board.editingLead} courses={board.courses} />
    </div>
  );
}
