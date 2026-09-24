"use client";

import { Clock, HelpCircle, Pencil, Phone, Trash2 } from "lucide-react";
import type { Lead, LeadStatus } from "./types";

type Props = { lead: Lead; dragged: boolean; onDragStart: (event: React.DragEvent, id: string) => void; onEdit: (lead: Lead) => void; onDelete: (id: string) => void; onMove: (id: string, status: LeadStatus) => void; onQuiz: (lead: Lead) => void; sourceClass: string };

const statusOptions: Array<{ value: LeadStatus; label: string }> = [
  { value: "new", label: "Yangi" },
  { value: "contacted", label: "Bog&apos;lanildi" },
  { value: "consultation", label: "Konsultatsiya" },
  { value: "paid", label: "To&apos;langan" },
  { value: "rejected", label: "Rad etildi" },
  { value: "cancelled", label: "Bekor qilindi" },
];

export function LeadCard({ lead, dragged, onDragStart, onEdit, onDelete, onMove, onQuiz, sourceClass }: Props) {
  return (
    <article draggable onDragStart={(event) => onDragStart(event, lead.id)} className={`cursor-grab space-y-3 rounded-xl border border-border bg-bg p-4 shadow-sm transition active:cursor-grabbing ${dragged ? "border-accent opacity-50" : "hover:border-brand/30 hover:shadow-md"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h4 className="truncate text-sm font-semibold text-ink">{lead.name}</h4><a href={`tel:${lead.phone}`} className="mt-1 inline-flex min-h-8 items-center text-xs font-medium text-brand hover:underline"><Phone className="mr-1 h-3.5 w-3.5" />{lead.phone}</a></div>
        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${sourceClass}`}>{lead.source}</span>
      </div>
      {lead.recommendedCourseTitle && <div className="rounded-lg bg-bg-sunken px-3 py-2 text-xs leading-5 text-ink-muted">Tavsiya: {lead.recommendedCourseTitle}</div>}
      {lead.quizAnswers && <button type="button" onClick={() => onQuiz(lead)} className="flex min-h-11 items-center text-xs font-medium text-brand hover:underline"><HelpCircle className="mr-1.5 h-4 w-4" />Quiz javoblarini ko&apos;rish</button>}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
        <span className="flex items-center text-xs text-ink-subtle"><Clock className="mr-1.5 h-3.5 w-3.5" />{new Date(lead.createdAt).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" })}</span>
        <div className="flex items-center gap-1">
          <label className="sr-only" htmlFor={`lead-status-${lead.id}`}>Holatni o&apos;zgartirish</label>
          <select id={`lead-status-${lead.id}`} value={lead.status} onChange={(event) => onMove(lead.id, event.target.value as LeadStatus)} className="min-h-11 max-w-36 rounded-lg border border-border bg-bg-sunken px-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" title="Touch uchun holatni o&apos;zgartiring">
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="button" onClick={() => onEdit(lead)} className="grid h-11 w-11 place-items-center rounded-lg text-ink-muted hover:bg-bg-sunken hover:text-ink" title="Tahrirlash" aria-label={`${lead.name}ni tahrirlash`}><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => onDelete(lead.id)} className="grid h-11 w-11 place-items-center rounded-lg text-ink-muted hover:bg-danger-soft hover:text-danger" title="O&apos;chirish" aria-label={`${lead.name}ni o&apos;chirish`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  );
}

export function sourceBadge(source: string) {
  if (source === "quiz") return "bg-brand-soft text-brand border-brand/20";
  if (source === "telegram") return "bg-telegram-soft text-telegram border-telegram/20";
  if (source === "form" || source === "free_lesson") return "bg-success-soft text-success border-success/20";
  return "bg-gold-soft text-gold border-gold/20";
}
