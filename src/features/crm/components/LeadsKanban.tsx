"use client";

import { Filter, Plus, Search } from "lucide-react";
import { useKanban } from "./Leads/useKanban";
import { KanbanBoard } from "./Leads/KanbanBoard";
import { LeadModal } from "./Leads/LeadModal";
import type { LeadStatus } from "./Leads/types";

export function LeadsKanban() {
  const board = useKanban();
  const dragStart = (event: React.DragEvent, id: string) => { event.dataTransfer.setData("text/plain", id); board.setDraggedLeadId(id); };
  const drop = async (event: React.DragEvent, status: LeadStatus) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain") || board.draggedLeadId; if (id) await board.moveStatus(id, status); board.setDraggedLeadId(null); };
  return <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-cream-warm p-4 rounded-xl border border-border"><div className="flex flex-wrap items-center gap-3 flex-1"><div className="relative flex-1 min-w-[240px]"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" /><input type="text" placeholder="Mijoz ismi yoki telefon bo'yicha qidiruv..." value={board.searchQuery} onChange={(e) => board.setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent" /></div><div className="flex items-center space-x-2"><Filter className="w-4 h-4 text-ink-muted" /><select value={board.sourceFilter} onChange={(e) => board.setSourceFilter(e.target.value)} className="px-3 py-2 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent"><option value="all">Barcha manbalar</option><option value="quiz">Diagnostika Quiz</option><option value="free_lesson">Bepul dars</option><option value="form">Sayt formasi</option><option value="telegram">Telegram</option><option value="manual">Manual (Qo'lda)</option></select></div></div><button onClick={() => { board.setEditingLead(null); board.setIsModalOpen(true); }} className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 shrink-0 shadow-sm"><Plus className="w-4 h-4" /><span>Yangi Lead Qo'shish</span></button></div>
    <KanbanBoard leads={board.leads} draggedLeadId={board.draggedLeadId} onDragStart={dragStart} onDragOver={(e) => e.preventDefault()} onDrop={drop} onEdit={(lead) => { board.setEditingLead(lead); board.setIsModalOpen(true); }} onDelete={board.deleteLead} onMove={board.moveStatus} onQuiz={board.setQuizDetailsLead} />
    {board.quizDetailsLead && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"><div className="bg-cream border border-border rounded-xl p-6 max-w-md w-full space-y-4"><h3 className="text-lg font-bold text-ink">Diagnostika Quiz Natijalari: {board.quizDetailsLead.name}</h3><div className="bg-cream-warm border border-border rounded-lg p-4 max-h-60 overflow-y-auto text-xs space-y-2 font-mono"><pre className="whitespace-pre-wrap">{JSON.stringify(board.quizDetailsLead.quizAnswers, null, 2)}</pre></div><div className="flex justify-end"><button onClick={() => board.setQuizDetailsLead(null)} className="btn-secondary px-4 py-2 rounded-md text-sm">Yopish</button></div></div></div>}
    <LeadModal isOpen={board.isModalOpen} onClose={() => board.setIsModalOpen(false)} onSave={board.saveLead} initialData={board.editingLead} courses={board.courses} />
  </div>;
}
