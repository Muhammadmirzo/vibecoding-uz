"use client";

import type { LucideIcon } from "lucide-react";
import type { Lead, LeadStatus } from "./types";
import { LeadCard, sourceBadge } from "./LeadCard";

export type PipelineStage = { id: LeadStatus; title: string; badgeBg: string; badgeText: string; icon: LucideIcon };
type Props = { stage: PipelineStage; leads: Lead[]; draggedLeadId: string | null; onDragStart: (event: React.DragEvent, id: string) => void; onDragOver: (event: React.DragEvent) => void; onDrop: (event: React.DragEvent, status: LeadStatus) => void; onEdit: (lead: Lead) => void; onDelete: (id: string) => void; onMove: (id: string, status: LeadStatus) => void; onQuiz: (lead: Lead) => void };
export function LeadColumn({ stage, leads, draggedLeadId, onDragStart, onDragOver, onDrop, onEdit, onDelete, onMove, onQuiz }: Props) {
  const StageIcon = stage.icon;
  return <div onDragOver={onDragOver} onDrop={(e) => onDrop(e, stage.id)} className="bg-cream-warm border border-border rounded-xl flex flex-col min-h-[500px] overflow-hidden"><div className="p-3.5 border-b border-border flex items-center justify-between bg-cream/50"><div className="flex items-center space-x-2"><span className={`inline-flex items-center p-1.5 rounded-md border ${stage.badgeBg}`}><StageIcon className={`w-4 h-4 ${stage.badgeText}`} /></span><h4 className="font-semibold text-sm text-ink">{stage.title}</h4></div><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cream-deep text-ink border border-border">{leads.length}</span></div><div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">{leads.length === 0 ? <div className="h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-ink-subtle">Leadlar mavjud emas (Drag & Drop qiling)</div> : leads.map((lead) => <LeadCard key={lead.id} lead={lead} dragged={draggedLeadId === lead.id} onDragStart={onDragStart} onEdit={onEdit} onDelete={onDelete} onMove={onMove} onQuiz={onQuiz} sourceClass={sourceBadge(lead.source)} />)}</div></div>;
}
