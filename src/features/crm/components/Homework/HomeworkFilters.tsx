"use client";
import { CheckSquare } from "lucide-react";
import type { HomeworkStatus } from "./types";
interface Props { status: HomeworkStatus; setStatus: (v: HomeworkStatus) => void; }
export function HomeworkFilters({ status, setStatus }: Props) { return (
    <div className="space-y-6">
      {/* Header & Filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-warm p-5 rounded-xl border border-border">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center">
            <CheckSquare className="w-6 h-6 mr-2 text-accent" />
            Uy Vazifalari Navbati (Homework Grading)
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Talabalar tomonidan topshirilgan amaliy topshiriqlarni rubrika mezonlari bo'yicha baholang.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center bg-cream border border-border p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setStatus("submitted")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              status === "submitted"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Tekshiruvda (Navbat)
          </button>
          <button
            onClick={() => setStatus("approved")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              status === "approved"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Qabul qilingan
          </button>
          <button
            onClick={() => setStatus("rejected")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              status === "rejected"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Qayta topshirish
          </button>
          <button
            onClick={() => setStatus("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              status === "all"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Barchasi
          </button>
        </div>
      </div>
    </div>
); }
