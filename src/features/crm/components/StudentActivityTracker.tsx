"use client";

import * as React from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Award,
  Send,
  RefreshCw,
  Eye,
  TrendingUp,
  X,
  ShieldAlert,
  Loader2,
} from "lucide-react";

export interface StudentActivityItem {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  cohortId: string;
  cohortName: string;
  lessonProgressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lastActiveAt: string;
  homeworkStats: {
    submitted: number;
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  quizScores: {
    diagnosticQuizPercent: number;
    midtermQuizPercent: number;
    avgQuizScorePercent: number;
  };
  status: "active" | "at_risk" | "completed" | "inactive";
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }>;
}

export interface ActivityKpis {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  completedStudents: number;
  avgProgressPercent: number;
  pendingHomeworkCount: number;
}

export function StudentActivityTracker() {
  const [students, setStudents] = React.useState<StudentActivityItem[]>([]);
  const [kpis, setKpis] = React.useState<ActivityKpis>({
    totalStudents: 0,
    activeStudents: 0,
    atRiskStudents: 0,
    completedStudents: 0,
    avgProgressPercent: 0,
    pendingHomeworkCount: 0,
  });
  const [loading, setLoading] = React.useState(true);

  // Filter States
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [cohortFilter, setCohortFilter] = React.useState<string>("");

  // Modal / Detail State
  const [selectedStudent, setSelectedStudent] = React.useState<StudentActivityItem | null>(null);
  const [notifySuccess, setNotifySuccess] = React.useState<string | null>(null);

  const fetchStudentActivity = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (cohortFilter) params.append("cohortId", cohortFilter);

      const res = await fetch(`/api/admin/students/activity?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setStudents(data.students || []);
        if (data.kpis) setKpis(data.kpis);
      }
    } catch (err) {
      console.error("Failed to fetch student activity:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStudentActivity();
  }, [search, statusFilter, cohortFilter]);

  // Relative Time Formatter
  const formatLastActive = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return "Hozirgina online";
      if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} soat oldin`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Kechagi kunda";
      if (diffDays < 30) return `${diffDays} kun oldin`;

      return date.toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });
    } catch {
      return isoString;
    }
  };

  const statusBadgeStyle = (status: StudentActivityItem["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
      case "at_risk":
        return "bg-amber-500/10 text-amber-700 border-amber-500/30 font-semibold";
      case "completed":
        return "bg-accent-soft text-accent border-accent-line";
      case "inactive":
        return "bg-rose-500/10 text-rose-700 border-rose-500/30";
      default:
        return "bg-cream-deep text-ink-muted border-border";
    }
  };

  const statusLabel = (status: StudentActivityItem["status"]) => {
    switch (status) {
      case "active":
        return "Faol";
      case "at_risk":
        return "Xavf ostida";
      case "completed":
        return "Bitirgan";
      case "inactive":
        return "Passiv";
      default:
        return status;
    }
  };

  const handleSendReminder = (student: StudentActivityItem) => {
    setNotifySuccess(`${student.fullName} ga Telegram/SMS eslatmasi yuborildi!`);
    setTimeout(() => setNotifySuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Talabalar Faolligi &amp; O&apos;zlashtirish Monitoringi
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Guruhlar va talabalarning dars progressi, oxirgi online vaqti, uy vazifalari va quiz natijalarini real-vaqtda kuzatish.
          </p>
        </div>

        <button
          onClick={fetchStudentActivity}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cream-warm border border-border text-xs font-semibold text-ink hover:bg-cream-deep transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-accent ${loading ? "animate-spin" : ""}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notifySuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notifySuccess}</span>
          </div>
          <button onClick={() => setNotifySuccess(null)} className="text-emerald-800 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-cream-warm border border-border space-y-1 shadow-sm">
          <div className="text-xs font-mono font-medium text-ink-muted uppercase">Jami Talabalar</div>
          <div className="text-2xl font-extrabold text-ink">{kpis.totalStudents}</div>
          <div className="text-[11px] text-ink-subtle font-mono">Barcha aktiv guruhlar</div>
        </div>

        <div className="p-4 rounded-xl bg-cream-warm border border-border space-y-1 shadow-sm">
          <div className="text-xs font-mono font-medium text-emerald-700 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Faol Talabalar
          </div>
          <div className="text-2xl font-extrabold text-ink">{kpis.activeStudents}</div>
          <div className="text-[11px] text-emerald-700 font-medium">muntazam dars qilmoqda</div>
        </div>

        <div className="p-4 rounded-xl bg-cream-warm border border-border space-y-1 shadow-sm">
          <div className="text-xs font-mono font-medium text-amber-700 uppercase flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Xavf Ostida
          </div>
          <div className="text-2xl font-extrabold text-ink">{kpis.atRiskStudents}</div>
          <div className="text-[11px] text-amber-700 font-medium">&gt;3 kun passiv bo&apos;lganlar</div>
        </div>

        <div className="p-4 rounded-xl bg-cream-warm border border-border space-y-1 shadow-sm">
          <div className="text-xs font-mono font-medium text-ink-muted uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            O'rtacha Progress
          </div>
          <div className="text-2xl font-extrabold text-accent">{kpis.avgProgressPercent}%</div>
          <div className="text-[11px] text-ink-subtle font-mono">LMS darslar tamomlanishi</div>
        </div>

        <div className="p-4 rounded-xl bg-cream-warm border border-border space-y-1 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs font-mono font-medium text-ink-muted uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-accent" />
            Kutayotgan Vazifalar
          </div>
          <div className="text-2xl font-extrabold text-ink">{kpis.pendingHomeworkCount}</div>
          <div className="text-[11px] text-ink-subtle font-mono">Tekshirilishi zarur</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-cream-warm border border-border flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ism, telefon yoki email bo'yicha qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-cream border border-border text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-ink-muted hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 rounded-lg bg-cream border border-border text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">Barcha Holatlar</option>
            <option value="active">Faol Talabalar</option>
            <option value="at_risk">Xavf Ostida (Passiv)</option>
            <option value="completed">Bitirganlar</option>
            <option value="inactive">Nofaol</option>
          </select>
        </div>
      </div>

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
                          onClick={() => setSelectedStudent(student)}
                          className="p-1.5 rounded-md hover:bg-cream border border-border text-ink-muted hover:text-ink transition-colors"
                          title="Batafsil monitoring"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendReminder(student)}
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

      {/* Student Activity Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-cream-warm border border-border rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-accent text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {selectedStudent.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">{selectedStudent.fullName}</h3>
                  <p className="text-xs font-mono text-ink-muted">
                    {selectedStudent.phone} {selectedStudent.email ? `· ${selectedStudent.email}` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-md hover:bg-cream text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Overview in Modal */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-cream border border-border">
                <div className="text-[10px] font-mono uppercase text-ink-muted">Dars Progressi</div>
                <div className="text-xl font-extrabold text-accent mt-0.5">
                  {selectedStudent.lessonProgressPercent}%
                </div>
                <div className="text-[10px] text-ink-subtle">
                  {selectedStudent.completedLessonsCount} / {selectedStudent.totalLessonsCount} dars
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cream border border-border">
                <div className="text-[10px] font-mono uppercase text-ink-muted">Uy Vazifalari</div>
                <div className="text-xl font-extrabold text-ink mt-0.5">
                  {selectedStudent.homeworkStats.approved}/{selectedStudent.homeworkStats.total}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">tasdiqlangan</div>
              </div>

              <div className="p-3 rounded-lg bg-cream border border-border">
                <div className="text-[10px] font-mono uppercase text-ink-muted">Quiz Ballari</div>
                <div className="text-xl font-extrabold text-ink mt-0.5">
                  {selectedStudent.quizScores.avgQuizScorePercent}%
                </div>
                <div className="text-[10px] text-ink-subtle">o&apos;rtacha ball</div>
              </div>
            </div>

            {/* Cohort & Status Info */}
            <div className="p-4 rounded-lg bg-cream border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ink">Biriktirilgan Guruh:</span>
                <span className="font-mono text-ink-muted">{selectedStudent.cohortName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ink">Oxirgi Online Seans:</span>
                <span className="font-mono text-ink-muted">{formatLastActive(selectedStudent.lastActiveAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-ink">Monitoring Holati:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border ${statusBadgeStyle(
                    selectedStudent.status
                  )}`}
                >
                  {statusLabel(selectedStudent.status)}
                </span>
              </div>
            </div>

            {/* Timeline of Recent Activity */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase font-bold text-ink">Oxirgi Faoliyat Xronologiyasi</h4>
              {selectedStudent.recentActivity && selectedStudent.recentActivity.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {selectedStudent.recentActivity.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-lg bg-cream border border-border flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-accent" />
                        <span className="font-medium text-ink">{act.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-ink-subtle">
                        {formatLastActive(act.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-cream border border-border text-xs text-ink-subtle text-center font-mono">
                  Yaqin kunlarda faoliyat harakatlari qayd etilmagan.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 border-t border-border pt-4">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg bg-cream border border-border text-xs font-semibold text-ink hover:bg-cream-deep"
              >
                Yopish
              </button>
              <button
                onClick={() => {
                  handleSendReminder(selectedStudent);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Eslatma Yuborish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
