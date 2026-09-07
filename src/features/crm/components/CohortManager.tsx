"use client";

import { useState, useEffect } from "react";
import { Cohort } from "../types";
import { CohortModal } from "./CohortModal";
import {
  GraduationCap,
  Plus,
  Flame,
  Clock,
  Users,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function CohortManager() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cohorts");
      if (!res.ok) throw new Error("Guruhlarni yuklab bo'lmadi");
      const data = await res.json();
      setCohorts(data.cohorts || []);

      const uniqueCourses = Array.from(
        new Map(
          (data.cohorts || []).map((c: Cohort) => [c.courseId, { id: c.courseId, title: c.courseTitle }])
        ).values()
      ) as Array<{ id: string; title: string }>;
      setCourses(uniqueCourses);
    } catch (err) {
      console.error("fetchCohorts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, []);

  const handleSaveCohort = async (cohortData: Record<string, unknown>) => {
    if (cohortData.id) {
      const res = await fetch(`/api/admin/cohorts/${cohortData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cohortData),
      });
      if (!res.ok) throw new Error("Guruhni yangilashda xatolik");
    } else {
      const res = await fetch("/api/admin/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cohortData),
      });
      if (!res.ok) throw new Error("Yangi guruh yaratishda xatolik");
    }
    await fetchCohorts();
  };

  const handleDeleteCohort = async (cohortId: string) => {
    if (!confirm("Ushbu guruhni o'chirishga ishonchingiz komilmi?")) return;
    try {
      const res = await fetch(`/api/admin/cohorts/${cohortId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCohorts((prev) => prev.filter((c) => c.id !== cohortId));
      }
    } catch (err) {
      console.error("Delete cohort error:", err);
    }
  };

  const formatMoney = (val?: string | null) => {
    if (!val) return null;
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat("uz-UZ").format(num) + " so'm";
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-warm p-5 rounded-xl border border-border">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center">
            <GraduationCap className="w-6 h-6 mr-2 text-accent" />
            Guruhlar va Qabul Boshqaruvi
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Guruh o'rinlari (seats count), early bird narxlari va qabul muddatlarini boshqaring.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCohort(null);
            setIsModalOpen(true);
          }}
          className="btn-primary px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Guruh Qo'shish</span>
        </button>
      </div>

      {/* Cohorts Grid */}
      {loading ? (
        <div className="text-center py-12 text-ink-muted text-sm">
          Guruhlar yuklanmoqda...
        </div>
      ) : cohorts.length === 0 ? (
        <div className="bg-cream-warm border border-dashed border-border rounded-xl p-12 text-center text-ink-muted">
          Hozircha hech qanday guruh yaratilmagan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort) => {
            const fillPercentage = Math.min(
              100,
              Math.round((cohort.enrolledSeats / cohort.seats) * 100)
            );

            return (
              <div
                key={cohort.id}
                className="bg-cream border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-accent-soft text-accent rounded-md border border-accent-line">
                      {cohort.courseTitle}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        cohort.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-ink-subtle/10 text-ink-subtle border border-border"
                      }`}
                    >
                      {cohort.status === "active" ? "Faol" : "Yopilgan"}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-ink leading-tight">
                    {cohort.name}
                  </h3>

                  <div className="flex items-center text-xs text-ink-muted space-x-2 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Boshlanishi:{" "}
                      {new Date(cohort.startsAt).toLocaleDateString("uz-UZ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Seat Capacity Progress */}
                <div className="space-y-1.5 bg-cream-warm p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between text-xs text-ink font-medium">
                    <span className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-accent" />
                      Qabul qilingan o'rinlar:
                    </span>
                    <span>
                      {cohort.enrolledSeats} / {cohort.seats} ({fillPercentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-cream-deep h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        fillPercentage >= 90
                          ? "bg-red-500"
                          : fillPercentage >= 70
                          ? "bg-amber-500"
                          : "bg-accent"
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-ink-subtle flex justify-between">
                    <span>Qolgan joylar: {cohort.remainingSeats} ta</span>
                    <span>{cohort.seats - cohort.enrolledSeats === 0 ? "To'ldi!" : ""}</span>
                  </div>
                </div>

                {/* Early Bird Expiration Status Card */}
                <div className="p-3 rounded-lg border text-xs space-y-2 bg-cream-warm border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink flex items-center">
                      <DollarSign className="w-3.5 h-3.5 mr-1 text-accent" />
                      Asosiy Narx:
                    </span>
                    <span className="font-bold text-ink">
                      {formatMoney(cohort.priceSum)}
                    </span>
                  </div>

                  {cohort.earlyPriceSum && (
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <span className="font-semibold text-accent flex items-center">
                        <Flame className="w-3.5 h-3.5 mr-1" />
                        Early Bird Chegirma:
                      </span>
                      <span className="font-bold text-accent">
                        {formatMoney(cohort.earlyPriceSum)}
                      </span>
                    </div>
                  )}

                  {/* Early Bird Expiration Badge */}
                  {cohort.earlyDeadline && (
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      {cohort.isEarlyBirdActive ? (
                        <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                          <Clock className="w-3 h-3 mr-1 animate-pulse" />
                          Early bird faol ({cohort.earlyBirdDaysLeft} kun qoldi)
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-500 font-medium">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Chegirma muddati tugadi
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      setEditingCohort(cohort);
                      setIsModalOpen(true);
                    }}
                    className="p-2 btn-secondary rounded-lg text-xs font-medium flex items-center space-x-1"
                    title="Guruhni tahrirlash"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCohort(cohort.id)}
                    className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg text-xs transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cohort Modal Dialog */}
      <CohortModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCohort}
        initialData={editingCohort}
        courses={courses}
      />
    </div>
  );
}
