"use client";
import { Clock, ExternalLink, Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { HomeworkSubmission } from "./types";
interface Props { submissions: HomeworkSubmission[]; loading: boolean; onOpen: (s: HomeworkSubmission) => void; }
export function HomeworkQueueTable({ submissions, loading, onOpen }: Props) { return (<>
      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12 text-ink-muted text-sm">
          Topshiriqlar yuklanmoqda...
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-bg-sunken border border-dashed border-border rounded-xl p-12 text-center text-ink-muted">
          Ushbu statusda hech qanday topshiriq yo'q.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-bg-elevated border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Info Left */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base text-ink">
                    {sub.studentName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bg-sunken border border-border text-ink-muted">
                    Urinish #{sub.attemptNo}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      sub.status === "approved"
                        ? "bg-success-soft text-success border border-success/20"
                        : sub.status === "rejected"
                        ? "bg-danger-soft text-danger border border-danger/20"
                        : "bg-gold-soft text-gold border border-gold/20"
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
                      className="inline-flex min-h-11 items-center text-accent hover:underline bg-bg-sunken px-3 rounded-lg border border-border"
                    >
                      <Github className="w-3.5 h-3.5 mr-1" />
                      Github Repozitoriya
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                  {sub.payload?.note && (
                    <span className="italic bg-bg-sunken px-2.5 py-1 rounded border border-border max-w-md truncate">
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

                <Button
                  type="button"
                  onClick={() => onOpen(sub)}
                  className="w-full text-sm sm:w-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{sub.review ? "Bahoni qayta ko'rish" : "Tekshirish va Baholash"}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
</>
); }
