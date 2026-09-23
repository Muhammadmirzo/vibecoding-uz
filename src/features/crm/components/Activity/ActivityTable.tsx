"use client";
import { Award, Clock, Eye, Loader2, Send } from "lucide-react";
import { formatLastActive, statusBadgeStyle, statusLabel } from "./useActivity";
import type { StudentActivityItem } from "./types";
interface Props { students: StudentActivityItem[]; loading: boolean; onSelect: (s: StudentActivityItem) => void; onReminder: (s: StudentActivityItem) => void; }
export function ActivityTable({ students, loading, onSelect, onReminder }: Props) { return (<>
      {/* Main Student Activity Table */}
      <div className="bg-cream-warm border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-cream-deep/60 text-[11px] font-mono font-semibold text-ink-muted uppercase tracking-wider">
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
                  <tr key={student.id} className="hover:bg-cream/60 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-accent-soft text-accent border border-accent-line font-bold flex items-center justify-center text-xs">
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
                        <div className="w-full h-2 rounded-full bg-cream-deep overflow-hidden border border-border/50">
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
                          <span className="text-emerald-700">{student.homeworkStats.approved} o&apos;tdi</span>
                          {student.homeworkStats.pending > 0 && (
                            <span className="text-amber-700">· {student.homeworkStats.pending} kutilmoqda</span>
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
                          className="p-1.5 rounded-md hover:bg-cream border border-border text-ink-muted hover:text-ink transition-colors"
                          title="Batafsil monitoring"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReminder(student)}
                          className="p-1.5 rounded-md hover:bg-accent-soft border border-accent-line text-accent transition-colors"
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
