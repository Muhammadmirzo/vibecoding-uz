"use client";

import { GraduationCap, Plus } from "lucide-react";
import { useCohorts } from "./Cohorts/useCohorts";
import { CohortTable } from "./Cohorts/CohortTable";
import { CohortModal } from "./Cohorts/CohortModal";
import { useState } from "react";
import type { Cohort } from "./Cohorts/types";

export function CohortManager() { const state=useCohorts(); const [open,setOpen]=useState(false); const [editing,setEditing]=useState<Cohort|null>(null); return <div className="space-y-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-warm p-5 rounded-xl border border-border"><div><h2 className="text-xl font-bold text-ink flex items-center"><GraduationCap className="w-6 h-6 mr-2 text-accent"/>Guruhlar va Qabul Boshqaruvi</h2><p className="text-sm text-ink-muted mt-1">Guruh o&apos;rinlari (seats count), early bird narxlari va qabul muddatlarini boshqaring.</p></div><button onClick={()=>{setEditing(null);setOpen(true)}} className="btn-primary px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 shrink-0 shadow-sm"><Plus className="w-4 h-4"/><span>Yangi Guruh Qo&apos;shish</span></button></div>{state.loading?<div className="text-center py-12 text-ink-muted text-sm">Guruhlar yuklanmoqda...</div>:state.cohorts.length===0?<div className="bg-cream-warm border border-dashed border-border rounded-xl p-12 text-center text-ink-muted">Hozircha hech qanday guruh yaratilmagan.</div>:<CohortTable cohorts={state.cohorts} onEdit={(cohort)=>{setEditing(cohort);setOpen(true)}} onDelete={state.remove}/>}<CohortModal isOpen={open} onClose={()=>setOpen(false)} onSave={state.save} initialData={editing} courses={state.courses}/></div>; }
