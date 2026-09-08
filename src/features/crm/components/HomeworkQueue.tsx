"use client";

import { useState, useEffect } from "react";
import { HomeworkSubmission, CriterionResult } from "../types";
import {
  CheckSquare,
  Clock,
  Github,
  ExternalLink,
  Star,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Send,
  Sparkles,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

const DEFAULT_RUBRIC: CriterionResult[] = [
  { criterion: "AI Prompt samaradorligi", score: 8, maxScore: 10 },
  { criterion: "Kod arxitekturasi va ishlashi", score: 8, maxScore: 10 },
  { criterion: "Topshiriq talablariga mosligi", score: 9, maxScore: 10 },
  { criterion: "UI/UX sifati", score: 8, maxScore: 10 },
];

const FEEDBACK_TEMPLATES = [
  {
    label: "✨ A'lo (Ajoyib ish)",
    text: "Ajoyib ish! Kod arxitekturasi va AI promptlaridan foydalanish ko'nikmalari a'lo darajada namoyon etilgan. Barcha mezonlar va talablar to'liq bajarildi.",
  },
  {
    label: "⚠️ Yaxshi (Tavsiyalar bilan)",
    text: "Yaxshi natija! Mahsulot ishlaydi, lekin AI promptlariga ko'proq kontekst berish va kod strukturasini modullarga ajratish tavsiya etiladi.",
  },
  {
    label: "❌ Qayta topshirish talab etiladi",
    text: "Topshiriq mezonlariga yetarlicha mos emas. Iltimos, Github repozitoriyasidagi xatoliklarni tuzatib va promptlar jurnalini to'ldirib qayta topshiring.",
  },
];

export function HomeworkQueue() {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("submitted");

  // Rubric evaluation state
  const [criteria, setCriteria] = useState<CriterionResult[]>(DEFAULT_RUBRIC);
  const [feedbackMd, setFeedbackMd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/homework?status=${statusFilter}`);
      if (!res.ok) throw new Error("Topshiriqlarni yuklab bo'lmadi");
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error("fetchSubmissions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const openEvaluationModal = (sub: HomeworkSubmission) => {
    setSelectedSubmission(sub);
    if (sub.review && sub.review.criteriaResults) {
      setCriteria(sub.review.criteriaResults);
      setFeedbackMd(sub.review.feedbackMd || "");
    } else {
      setCriteria(DEFAULT_RUBRIC);
      setFeedbackMd("");
    }
    setError(null);
  };

  // Calculate overall score (0-10)
  const calculateOverallScore = (): number => {
    if (criteria.length === 0) return 0;
    const total = criteria.reduce((sum, c) => sum + c.score, 0);
    const maxTotal = criteria.reduce((sum, c) => sum + c.maxScore, 0);
    const score = (total / maxTotal) * 10;
    return Math.round(score * 10) / 10;
  };

  const handleCriterionScoreChange = (index: number, newScore: number) => {
    setCriteria((prev) =>
      prev.map((item, i) => (i === index ? { ...item, score: newScore } : item))
    );
  };

  const handleApplyTemplate = (text: string) => {
    setFeedbackMd(text);
  };

  const handleGradeSubmission = async (status: "approved" | "rejected") => {
    if (!selectedSubmission) return;

    try {
      setSubmitting(true);
      setError(null);
      const score = calculateOverallScore();

      const res = await fetch(`/api/admin/homework/${selectedSubmission.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          criteriaResults: criteria,
          score,
          feedbackMd,
          status,
        }),
      });

      if (!res.ok) throw new Error("Baholashda xatolik yuz berdi");

      setSelectedSubmission(null);
      await fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            onClick={() => setStatusFilter("submitted")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === "submitted"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Tekshiruvda (Navbat)
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === "approved"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Qabul qilingan
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === "rejected"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Qayta topshirish
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Barchasi
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12 text-ink-muted text-sm">
          Topshiriqlar yuklanmoqda...
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-cream-warm border border-dashed border-border rounded-xl p-12 text-center text-ink-muted">
          Ushbu statusda hech qanday topshiriq yo'q.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-cream border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Info Left */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base text-ink">
                    {sub.studentName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cream-warm border border-border text-ink-muted">
                    Urinish #{sub.attemptNo}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      sub.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : sub.status === "rejected"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {sub.status === "submitted"
                      ? "Tekshiruv kutilmoqda"
                      : sub.status === "approved"
                      ? "Qabul qilindi"
                      : "Qayta topshirish"}
                  </span>
                </div>

                <div className="text-sm font-medium text-accent">
                  📚 Dars: {sub.lessonTitle || "Amaliy topshiriq"}
                </div>

                {/* Payload info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted pt-1">
                  {sub.payload?.githubUrl && (
                    <a
                      href={sub.payload.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-accent hover:underline bg-cream-warm px-2.5 py-1 rounded border border-border"
                    >
                      <Github className="w-3.5 h-3.5 mr-1" />
                      Github Repozitoriya
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                  {sub.payload?.note && (
                    <span className="italic bg-cream-warm px-2.5 py-1 rounded border border-border max-w-md truncate">
                      "{sub.payload.note}"
                    </span>
                  )}
                  <span className="flex items-center text-ink-subtle">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(sub.submittedAt).toLocaleString("uz-UZ")}
                  </span>
                </div>
              </div>

              {/* Review Score & Action Right */}
              <div className="flex items-center space-x-3 shrink-0">
                {sub.review && (
                  <div className="text-right pr-2">
                    <div className="text-xs text-ink-subtle">Baho</div>
                    <div className="text-lg font-bold text-accent">
                      {sub.review.score} / 10
                    </div>
                  </div>
                )}

                <button
                  onClick={() => openEvaluationModal(sub)}
                  className="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{sub.review ? "Bahoni qayta ko'rish" : "Tekshirish va Baholash"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rubric Evaluation Modal Dialog */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-cream border border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-cream-warm flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">
                  Topshiriqni Baholash Rubrikasi
                </h3>
                <p className="text-xs text-ink-muted">
                  Talaba: <span className="font-semibold text-ink">{selectedSubmission.studentName}</span> | Dars: {selectedSubmission.lessonTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-ink-muted hover:text-ink p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Submission links preview */}
              <div className="bg-cream-warm p-4 rounded-lg border border-border space-y-2">
                <h4 className="font-semibold text-xs text-ink uppercase tracking-wider">
                  Topshirilgan materiallar:
                </h4>
                {selectedSubmission.payload?.githubUrl && (
                  <div>
                    <a
                      href={selectedSubmission.payload.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-accent hover:underline"
                    >
                      <Github className="w-4 h-4 mr-1.5" />
                      {selectedSubmission.payload.githubUrl}
                    </a>
                  </div>
                )}
                {selectedSubmission.payload?.note && (
                  <p className="text-xs text-ink-muted italic">
                    Izoh: "{selectedSubmission.payload.note}"
                  </p>
                )}
              </div>

              {/* Rubric Criteria sliders/inputs (0-10) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-bold text-sm text-ink">
                    Baholash Mezonlari (Rubrika)
                  </h4>
                  <div className="text-sm font-bold text-accent px-3 py-1 bg-accent-soft rounded-lg border border-accent-line">
                    Jami Baho: {calculateOverallScore()} / 10
                  </div>
                </div>

                <div className="space-y-3">
                  {criteria.map((item, index) => (
                    <div
                      key={item.criterion}
                      className="bg-cream-warm p-3.5 rounded-lg border border-border space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-ink">
                        <span>{item.criterion}</span>
                        <span className="text-accent font-bold text-sm">
                          {item.score} / {item.maxScore}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={item.score}
                        onChange={(e) =>
                          handleCriterionScoreChange(index, Number(e.target.value))
                        }
                        className="w-full accent-accent cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Quick Templates */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                  Tayyor Shablon Izohlar:
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl.text)}
                      className="text-xs px-2.5 py-1.5 bg-cream-warm border border-border hover:border-accent rounded-md text-ink transition-colors text-left"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Markdown Feedback Textarea */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                  Taqriz va Mentoring Izohi (Markdown):
                </label>
                <textarea
                  rows={4}
                  value={feedbackMd}
                  onChange={(e) => setFeedbackMd(e.target.value)}
                  placeholder="Talabaga beriladigan taqriz, tavsiyalar va xatoliklar ko'rsatmasi..."
                  className="w-full px-3 py-2 bg-cream-warm border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="px-6 py-4 border-t border-border bg-cream-warm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 btn-secondary rounded-lg text-sm font-medium order-2 sm:order-1"
                disabled={submitting}
              >
                Yopish
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => handleGradeSubmission("rejected")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  disabled={submitting}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Qayta topshirish
                </button>
                <button
                  type="button"
                  onClick={() => handleGradeSubmission("approved")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  disabled={submitting}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Qabul qilish (Approve)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
