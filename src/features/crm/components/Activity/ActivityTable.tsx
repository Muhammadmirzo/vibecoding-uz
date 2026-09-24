"use client";
import { Award, Clock, Eye, Loader2, Send } from "lucide-react";
import { formatLastActive, statusBadgeStyle, statusLabel } from "./useActivity";
import type { StudentActivityItem } from "./types";
interface Props { students: StudentActivityItem[]; loading: boolean; onSelect: (s: StudentActivityItem) => void; onReminder: (s: StudentActivityItem) => void; }

function MobileActivityCards({ students, loading, onSelect, onReminder }: Pick<Props, "students" | "loading" | "onSelect" | "onReminder">) {
  if (loading) return <div role="status" className="grid min-h-48 place-items-center rounded-2xl border border-border bg-bg-elevated md:hidden"><div className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" /><p className="mt-2 text-sm text-ink-muted">Ma&apos;lumotlar yuklanmoqda...</p></div></div>;
  if (!students.length) return <div className="rounded-2xl border border-dashed border-border bg-bg-elevated p-10 text-center text-sm text-ink-muted md:hidden">Talabalar topilmadi. Qidiruv shartlarini tekshiring.</div>;
  return <div className="space-y-3 md:hidden">{students.map((student) => <article key={student.id} className="rounded-xl border border-border bg-bg-elevated p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent">{student.fullName.charAt(0)}</span><div className="min-w-0"><h3 className="truncate font-semibold text-ink">{student.fullName}</h3><p className="truncate text-xs text-ink-muted">{student.phone}</p></div></div><span className={`rounded-md border px-2 py-1 text-[11px] ${statusBadgeStyle(student.status)}`}>{statusLabel(student.status)}</span></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-ink-subtle">Guruh</dt><dd className="mt-1 truncate text-ink">{student.cohortName}</dd></div><div><dt className="text-xs text-ink-subtle">Dars</dt><dd className="mt-1 font-semibold text-ink">{student.lessonProgressPercent}%</dd></div><div><dt className="text-xs text-ink-subtle">Topshiriq</dt><dd className="mt-1 text-ink">{student.homeworkStats.approved}/{student.homeworkStats.total} o&apos;tdi</dd></div><div><dt className="text-xs text-ink-subtle">Quiz</dt><dd className="mt-1 text-ink">{student.quizScores.avgQuizScorePercent}%</dd></div></dl><div className="mt-4 flex gap-2 border-t border-border pt-3"><button type="button" onClick={() => onSelect(student)} className="min-h-11 flex-1 rounded-lg bg-bg-sunken px-3 text-sm font-medium text-ink">Batafsil</button><button type="button" onClick={() => onReminder(student)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-telegram-soft px-3 text-sm font-medium text-telegram"><Send className="h-4 w-4" />Eslatma</button></div></article>)}</div>;
}

export function ActivityTable({ students, loading, onSelect, onReminder }: Props) { return (<>
      <MobileActivityCards students={students} loading={loading} onSelect={onSelect} onReminder={onReminder} />
      {/* Main Student Activity Table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-bg-sunken shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-sunken/60 text-[11px] font-mono font-semibold text-ink-muted uppercase tracking-wider">
                <th className="py-3 px-4">Talaba</th>
                <th className="py-3 px-4">Guruh</th>
                <th className="py-3 px-4">Dars Progressi</th>
                <th className="py-3 px-4">Oxirgi Faollik</th>
                <th className="py-3 px-4">Uy Vazifalari</th>
                <th className="py-3 px-4">Quiz Ballari</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                      <span>Ma&apos;lumotlar yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-subtle font-mono">
                    Talabalar topilmadi. Qidiruv so&apos;rovini tekshiring.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-bg-elevated/60 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-accent-soft text-accent border border-border font-bold flex items-center justify-center text-xs">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-ink">{student.fullName}</div>
                          <div className="text-[11px] font-mono text-ink-subtle">{student.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Cohort */}
                    <td className="py-3.5 px-4 text-ink-muted">
                      <span className="truncate max-w-[160px] inline-block font-mono text-[11px]">
                        {student.cohortName}
                      </span>
                    </td>

                    {/* Lesson Completion Progress Bar */}
                    <td className="py-3.5 px-4 min-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-ink">{student.lessonProgressPercent}%</span>
                          <span className="text-ink-subtle">
                            {student.completedLessonsCount}/{student.totalLessonsCount} dars
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-bg-sunken overflow-hidden border border-border/50">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${student.lessonProgressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Last Active Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap text-ink-muted">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>{formatLastActive(student.lastActiveAt)}</span>
                      </div>
                    </td>

                    {/* Homework Submissions State */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-ink text-xs">
                          {student.homeworkStats.submitted}/{student.homeworkStats.total} topshirilgan
                        </div>
                        <div className="text-[10px] font-mono text-ink-muted flex items-center gap-1">
                          <span className="text-success">{student.homeworkStats.approved} o&apos;tdi</span>
                          {student.homeworkStats.pending > 0 && (
                            <span className="text-gold">· {student.homeworkStats.pending} kutilmoqda</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Quiz Scores */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-accent" />
                        <span className="font-bold text-ink text-xs">
                          {student.quizScores.avgQuizScorePercent}%
                        </span>
                        <span className="text-[10px] font-mono text-ink-subtle">o&apos;rtacha</span>
                      </div>
                    </td>

                    {/* Active Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono border ${statusBadgeStyle(
                          student.status
                        )}`}
                      >
                        {statusLabel(student.status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelect(student)}
                          className="p-1.5 rounded-md hover:bg-bg-elevated border border-border text-ink-muted hover:text-ink transition-colors"
                          title="Batafsil monitoring"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReminder(student)}
                          className="p-1.5 rounded-md hover:bg-accent-soft border border-border text-accent transition-colors"
                          title="Telegram eslatmasini yuborish"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
</>
); }
