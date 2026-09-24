"use client";

import { DollarSign, HelpCircle, PhoneCall, UserCheck } from "lucide-react";
import { LeadColumn, type PipelineStage } from "./LeadColumn";
import type { Lead, LeadStatus } from "./types";

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "new", title: "Yangi", badgeBg: "bg-brand-soft border-brand/20", badgeText: "text-brand", icon: HelpCircle },
  { id: "contacted", title: "Bog&apos;lanildi", badgeBg: "bg-gold-soft border-gold/20", badgeText: "text-gold", icon: PhoneCall },
  { id: "consultation", title: "Konsultatsiya", badgeBg: "bg-accent-soft border-accent/20", badgeText: "text-accent", icon: UserCheck },
  { id: "paid", title: "To&apos;langan", badgeBg: "bg-success-soft border-success/20", badgeText: "text-success", icon: DollarSign },
];

type Props = {
  leads: Lead[];
  draggedLeadId: string | null;
  onDragStart: (event: React.DragEvent, id: string) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent, status: LeadStatus) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: LeadStatus) => void;
  onQuiz: (lead: Lead) => void;
};

export function KanbanBoard(props: Props) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {PIPELINE_STAGES.map((stage) => (
        <LeadColumn key={stage.id} stage={stage} leads={props.leads.filter((lead) => lead.status === stage.id)} draggedLeadId={props.draggedLeadId} onDragStart={props.onDragStart} onDragOver={props.onDragOver} onDrop={props.onDrop} onEdit={props.onEdit} onDelete={props.onDelete} onMove={props.onMove} onQuiz={props.onQuiz} />
      ))}
    </div>
  );
}
