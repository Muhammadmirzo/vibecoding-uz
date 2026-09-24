"use client";

import type { LucideIcon } from "lucide-react";
import type { Lead, LeadStatus } from "./types";
import { LeadCard, sourceBadge } from "./LeadCard";

export type PipelineStage = { id: LeadStatus; title: string; badgeBg: string; badgeText: string; icon: LucideIcon };
type Props = { stage: PipelineStage; leads: Lead[]; draggedLeadId: string | null; onDragStart: (event: React.DragEvent, id: string) => void; onDragOver: (event: React.DragEvent) => void; onDrop: (event: React.DragEvent, status: LeadStatus) => void; onEdit: (lead: Lead) => void; onDelete: (id: string) => void; onMove: (id: string, status: LeadStatus) => void; onQuiz: (lead: Lead) => void };

export function LeadColumn({ stage, leads, draggedLeadId, onDragStart, onDragOver, onDrop, onEdit, onDelete, onMove, onQuiz }: Props) {
  const StageIcon = stage.icon;
  return (
    <section onDragOver={onDragOver} onDrop={(event) => onDrop(event, stage.id)} className="flex min-h-56 min-w-0 flex-col rounded-2xl border border-border bg-bg-elevated shadow-sm">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${stage.badgeBg}`}><StageIcon className={`h-4 w-4 ${stage.badgeText}`} /></span><h3 className="truncate text-sm font-semibold text-ink">{stage.title}</h3></div>
        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-bg-sunken px-2 text-xs font-semibold text-ink-muted">{leads.length}</span>
      </header>
      <div className="space-y-3 p-3 md:max-h-[calc(100vh-17rem)] md:overflow-y-auto">
        {leads.length === 0 ? <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-border p-4 text-center text-xs leading-5 text-ink-subtle">Bu bosqichda lead yo&apos;q. Boshqa bosqichdan suring.</div> : leads.map((lead) => <LeadCard key={lead.id} lead={lead} dragged={draggedLeadId === lead.id} onDragStart={onDragStart} onEdit={onEdit} onDelete={onDelete} onMove={onMove} onQuiz={onQuiz} sourceClass={sourceBadge(lead.source)} />)}
      </div>
    </section>
  );
}
