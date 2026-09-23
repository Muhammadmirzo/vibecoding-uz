"use client";
import { Clock, ExternalLink, Github, Sparkles } from "lucide-react";
import type { HomeworkSubmission } from "./types";
interface Props { submissions: HomeworkSubmission[]; loading: boolean; onOpen: (s: HomeworkSubmission) => void; }
export function HomeworkQueueTable({ submissions, loading, onOpen }: Props) { return (<>
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
                  onClick={() => onOpen(sub)}
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
</>
); }
