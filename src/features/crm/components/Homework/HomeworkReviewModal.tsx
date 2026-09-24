"use client";
import { CheckCircle, Github, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Form";
import { scoreOf } from "./useHomeworkQueue";
import { FEEDBACK_TEMPLATES, type CriterionResult, type HomeworkSubmission } from "./types";
interface Props { submission: HomeworkSubmission; criteria: CriterionResult[]; feedbackMd: string; setFeedbackMd: (v: string) => void; submitting: boolean; error: string | null; onClose: () => void; onScore: (i: number, score: number) => void; onTemplate: (text: string) => void; onGrade: (status: "approved" | "rejected") => void; }
export function HomeworkReviewModal({ submission, criteria, feedbackMd, setFeedbackMd, submitting, error, onClose, onScore, onTemplate, onGrade }: Props) { return (<>
      {/* Rubric Evaluation Modal Dialog */}
      {submission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-bg-elevated border border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-bg-sunken flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">
                  Topshiriqni Baholash Rubrikasi
                </h3>
                <p className="text-xs text-ink-muted">
                  Talaba: <span className="font-semibold text-ink">{submission.studentName}</span> | Dars: {submission.lessonTitle}
                </p>
              </div>
              <button
                onClick={() => onClose()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {error && (
                <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Submission links preview */}
              <div className="bg-bg-sunken p-4 rounded-lg border border-border space-y-2">
                <h4 className="font-semibold text-xs text-ink uppercase tracking-wider">
                  Topshirilgan materiallar:
                </h4>
                {submission.payload?.githubUrl && (
                  <div>
                    <a
                      href={submission.payload.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-accent hover:underline"
                    >
                      <Github className="w-4 h-4 mr-1.5" />
                      {submission.payload.githubUrl}
                    </a>
                  </div>
                )}
                {submission.payload?.note && (
                  <p className="text-xs text-ink-muted italic">
                    Izoh: "{submission.payload.note}"
                  </p>
                )}
              </div>

              {/* Rubric Criteria sliders/inputs (0-10) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-bold text-sm text-ink">
                    Baholash Mezonlari (Rubrika)
                  </h4>
                  <div className="text-sm font-bold text-accent px-3 py-1 bg-accent-soft rounded-lg border border-border">
                    Jami Baho: {scoreOf(criteria)} / 10
                  </div>
                </div>

                <div className="space-y-3">
                  {criteria.map((item, index) => (
                    <div
                      key={item.criterion}
                      className="bg-bg-sunken p-3.5 rounded-lg border border-border space-y-2"
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
                          onScore(index, Number(e.target.value))
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
                      onClick={() => onTemplate(tmpl.text)}
                      className="min-h-11 rounded-md border border-border bg-bg-sunken px-3 text-left text-sm text-ink transition-colors hover:border-accent"
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
                <Textarea
                  rows={4}
                  value={feedbackMd}
                  onChange={(e) => setFeedbackMd(e.target.value)}
                  placeholder="Talabaga beriladigan taqriz, tavsiyalar va xatoliklar ko'rsatmasi..."
                  className="min-h-32 text-base"
                />
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="px-6 py-4 border-t border-border bg-bg-sunken flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose()}
                className="order-2 w-full text-sm sm:order-1 sm:w-auto"
                disabled={submitting}
              >
                Yopish
              </Button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => onGrade("rejected")}
                  className="min-h-11 px-4 bg-danger hover:bg-danger/90 text-ink rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  disabled={submitting}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Qayta topshirish
                </button>
                <button
                  type="button"
                  onClick={() => onGrade("approved")}
                  className="min-h-11 px-4 bg-success hover:bg-success/90 text-ink rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
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
</>
); }
