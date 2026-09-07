"use client";

import { useState, useEffect } from "react";
import { Lead, LeadStatus } from "../types";
import { LeadModal } from "./LeadModal";
import {
  Plus,
  Search,
  Phone,
  Clock,
  HelpCircle,
  Pencil,
  Trash2,
  MoveRight,
  Filter,
  CheckCircle2,
  UserCheck,
  PhoneCall,
  DollarSign,
  AlertCircle,
} from "lucide-react";

const PIPELINE_STAGES: Array<{
  id: LeadStatus;
  title: string;
  badgeBg: string;
  badgeText: string;
  icon: typeof UserCheck;
}> = [
  {
    id: "new",
    title: "Yangi (New)",
    badgeBg: "bg-blue-500/10 border-blue-500/30",
    badgeText: "text-blue-600 dark:text-blue-400",
    icon: HelpCircle,
  },
  {
    id: "contacted",
    title: "Bog'lanildi (Contacted)",
    badgeBg: "bg-amber-500/10 border-amber-500/30",
    badgeText: "text-amber-600 dark:text-amber-400",
    icon: PhoneCall,
  },
  {
    id: "consultation",
    title: "Konsultatsiya (Consultation)",
    badgeBg: "bg-purple-500/10 border-purple-500/30",
    badgeText: "text-purple-600 dark:text-purple-400",
    icon: UserCheck,
  },
  {
    id: "paid",
    title: "To'langan (Paid)",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    icon: DollarSign,
  },
];

export function LeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [quizDetailsLead, setQuizDetailsLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/leads");
      if (!res.ok) throw new Error("Leadlarni yuklab bo'lmadi");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error("fetchLeads error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCohortsAndCourses = async () => {
    try {
      const res = await fetch("/api/admin/cohorts");
      if (res.ok) {
        const data = await res.json();
        const extracted = (data.cohorts || []).map(
          (c: { courseId: string; courseTitle: string }) => ({
            id: c.courseId,
            title: c.courseTitle,
          })
        );
        // Deduplicate courses
        const unique = Array.from(new Map(extracted.map((item: { id: string; title: string }) => [item.id, item])).values()) as Array<{ id: string; title: string }>;
        setCourses(unique);
      }
    } catch (err) {
      console.error("fetchCourses error:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchCohortsAndCourses();
  }, []);

  const handleSaveLead = async (leadData: Partial<Lead>) => {
    if (leadData.id) {
      // Update existing lead
      const res = await fetch(`/api/admin/leads/${leadData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
      if (!res.ok) throw new Error("Leadni yangilashda xatolik");
    } else {
      // Create new lead
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
      if (!res.ok) throw new Error("Yangi lead yaratishda xatolik");
    }
    await fetchLeads();
  };

  const handleMoveStatus = async (leadId: string, newStatus: LeadStatus) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        fetchLeads(); // rollback on failure
      }
    } catch (err) {
      console.error("Status update error:", err);
      fetchLeads();
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Ushbu leadni o'chirishga ishonchingiz komilmi?")) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
      }
    } catch (err) {
      console.error("Delete lead error:", err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (leadId) {
      await handleMoveStatus(leadId, targetStatus);
    }
    setDraggedLeadId(null);
  };

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "quiz":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "free_lesson":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "telegram":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      case "form":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-cream-warm p-4 rounded-xl border border-border">
        {/* Search & Source filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              placeholder="Mijoz ismi yoki telefon bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-ink-muted" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent"
            >
              <option value="all">Barcha manbalar</option>
              <option value="quiz">Diagnostika Quiz</option>
              <option value="free_lesson">Bepul dars</option>
              <option value="form">Sayt formasi</option>
              <option value="telegram">Telegram</option>
              <option value="manual">Manual (Qo'lda)</option>
            </select>
          </div>
        </div>

        {/* Add Lead Button */}
        <button
          onClick={() => {
            setEditingLead(null);
            setIsModalOpen(true);
          }}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Lead Qo'shish</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter(
            (lead) => lead.status === stage.id
          );
          const StageIcon = stage.icon;

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="bg-cream-warm border border-border rounded-xl flex flex-col min-h-[500px] overflow-hidden"
            >
              {/* Stage Header */}
              <div className="p-3.5 border-b border-border flex items-center justify-between bg-cream/50">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center p-1.5 rounded-md border ${stage.badgeBg}`}
                  >
                    <StageIcon className={`w-4 h-4 ${stage.badgeText}`} />
                  </span>
                  <h4 className="font-semibold text-sm text-ink">
                    {stage.title}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cream-deep text-ink border border-border">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {stageLeads.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-ink-subtle">
                    Leadlar mavjud emas (Drag & Drop qiling)
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className={`bg-cream border border-border rounded-lg p-3.5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-3 ${
                        draggedLeadId === lead.id ? "opacity-50 border-accent" : ""
                      }`}
                    >
                      {/* Top info */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-semibold text-sm text-ink leading-tight">
                            {lead.name}
                          </h5>
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center text-xs text-accent hover:underline mt-1"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            {lead.phone}
                          </a>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getSourceBadge(
                            lead.source
                          )}`}
                        >
                          {lead.source}
                        </span>
                      </div>

                      {/* Course recommendation if any */}
                      {lead.recommendedCourseTitle && (
                        <div className="text-xs px-2.5 py-1 bg-cream-warm border border-border rounded-md text-ink-muted">
                          🎯 {lead.recommendedCourseTitle}
                        </div>
                      )}

                      {/* Quiz answers link if available */}
                      {lead.quizAnswers && (
                        <button
                          onClick={() => setQuizDetailsLead(lead)}
                          className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center"
                        >
                          <HelpCircle className="w-3 h-3 mr-1" />
                          Quiz javoblarini ko'rish
                        </button>
                      )}

                      {/* Card Footer: Timestamps and Action Buttons */}
                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-ink-subtle">
                        <span className="flex items-center text-[10px]">
                          <Clock className="w-3 h-3 mr-1 text-ink-subtle" />
                          {new Date(lead.createdAt).toLocaleDateString("uz-UZ", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>

                        <div className="flex items-center space-x-1">
                          {/* Quick move dropdown */}
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleMoveStatus(lead.id, e.target.value as LeadStatus)
                            }
                            className="text-[11px] bg-cream-warm border border-border rounded px-1.5 py-0.5 text-ink focus:outline-none"
                            title="Bosqichni o'zgartirish"
                          >
                            <option value="new">Yangi</option>
                            <option value="contacted">Bog'lanildi</option>
                            <option value="consultation">Konsultatsiya</option>
                            <option value="paid">To'langan</option>
                            <option value="rejected">Rad etildi</option>
                          </select>

                          <button
                            onClick={() => {
                              setEditingLead(lead);
                              setIsModalOpen(true);
                            }}
                            className="p-1 hover:text-ink text-ink-muted rounded transition-colors"
                            title="Tahrirlash"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-1 hover:text-red-500 text-ink-muted rounded transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Modal popup */}
      {quizDetailsLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="bg-cream border border-border rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-ink">
              Diagnostika Quiz Natijalari: {quizDetailsLead.name}
            </h3>
            <div className="bg-cream-warm border border-border rounded-lg p-4 max-h-60 overflow-y-auto text-xs space-y-2 font-mono">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(quizDetailsLead.quizAnswers, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setQuizDetailsLead(null)}
                className="btn-secondary px-4 py-2 rounded-md text-sm"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
        initialData={editingLead}
        courses={courses}
      />
    </div>
  );
}
