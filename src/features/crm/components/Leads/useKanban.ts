"use client";

import { useEffect, useState } from "react";
import type { CourseOption, Lead, LeadStatus } from "./types";

export function useKanban() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [quizDetailsLead, setQuizDetailsLead] = useState<Lead | null>(null);
  const fetchLeads = async () => { try { setLoading(true); const res = await fetch("/api/admin/leads"); if (!res.ok) throw new Error("Leadlarni yuklab bo'lmadi"); const data = await res.json(); setLeads(data.leads || []); } catch (err) { console.error("fetchLeads error:", err); } finally { setLoading(false); } };
  const fetchCourses = async () => { try { const res = await fetch("/api/admin/cohorts"); if (!res.ok) return; const data = await res.json(); const extracted = (data.cohorts || []).map((item: { courseId: string; courseTitle: string }) => ({ id: item.courseId, title: item.courseTitle })); setCourses(Array.from(new Map< string, CourseOption >(extracted.map((item: CourseOption) => [item.id, item])).values())); } catch (err) { console.error("fetchCourses error:", err); } };
  useEffect(() => { void fetchLeads(); void fetchCourses(); }, []);
  const saveLead = async (data: Partial<Lead>) => { const res = await fetch(data.id ? `/api/admin/leads/${data.id}` : "/api/admin/leads", { method: data.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!res.ok) throw new Error(data.id ? "Leadni yangilashda xatolik" : "Yangi lead yaratishda xatolik"); await fetchLeads(); };
  const moveStatus = async (id: string, status: LeadStatus) => { setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status } : lead)); try { const res = await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); if (!res.ok) await fetchLeads(); } catch (err) { console.error("Status update error:", err); await fetchLeads(); } };
  const deleteLead = async (id: string) => { if (!confirm("Ushbu leadni o'chirishga ishonchingiz komilmi?")) return; try { const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" }); if (res.ok) setLeads((current) => current.filter((lead) => lead.id !== id)); } catch (err) { console.error("Delete lead error:", err); } };
  const filteredLeads = leads.filter((lead) => (lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.phone.toLowerCase().includes(searchQuery.toLowerCase())) && (sourceFilter === "all" || lead.source === sourceFilter));
  return { leads: filteredLeads, courses, loading, searchQuery, setSearchQuery, sourceFilter, setSourceFilter, isModalOpen, setIsModalOpen, editingLead, setEditingLead, draggedLeadId, setDraggedLeadId, quizDetailsLead, setQuizDetailsLead, fetchLeads, saveLead, moveStatus, deleteLead };
}
