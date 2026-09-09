"use client";

import { useState, useEffect } from "react";
import {
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Users,
  Layers,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2,
  PhoneCall,
  Info,
} from "lucide-react";

export interface BroadcastItem {
  id: string;
  title: string;
  channel: "telegram" | "email" | "sms" | "all";
  targetAudience: "all_users" | "active_students" | "leads_new" | "leads_consultation" | "cohort_students";
  cohortId: string | null;
  messageBody: string;
  status: "draft" | "sent" | "failed";
  recipientsCount: number;
  sentAt: string | null;
  createdAt: string;
}

export function NotificationManager() {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Cohorts for dropdown
  const [cohorts, setCohorts] = useState<Array<{ id: string; name: string }>>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState<"telegram" | "email" | "sms" | "all">("telegram");
  const [targetAudience, setTargetAudience] = useState<
    "all_users" | "active_students" | "leads_new" | "leads_consultation" | "cohort_students"
  >("all_users");
  const [cohortId, setCohortId] = useState("");
  const [messageBody, setMessageBody] = useState(
    "Assalomu alaykum {{fullName}}! Vibe Coding kursimizning navbatdagi moduli jonli darsi 19:00 da boshlanadi. Darsga kirish: {{loginUrl}}"
  );

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setBroadcasts(data.broadcasts || []);
      }
    } catch (err) {
      console.error("Fetch broadcasts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCohorts = async () => {
    try {
      const res = await fetch("/api/admin/cohorts");
      const data = await res.json();
      if (data.success && data.cohorts) {
        setCohorts(data.cohorts);
      }
    } catch (err) {
      console.error("Fetch cohorts error:", err);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    fetchCohorts();
  }, []);

  const insertVariable = (variableTag: string) => {
    setMessageBody((prev) => prev + " " + variableTag);
  };

  const handleSendBroadcast = async (status: "sent" | "draft") => {
    if (!title.trim()) {
      alert("Xabarnoma nomini kiriting");
      return;
    }
    if (!messageBody.trim()) {
      alert("Xabar matnini kiriting");
      return;
    }

    setSending(true);
    try {
      const payload = {
        title,
        channel,
        targetAudience,
        cohortId: targetAudience === "cohort_students" ? cohortId || null : null,
        messageBody,
        status,
      };

      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setTitle("");
        fetchBroadcasts();
        alert(status === "sent" ? "Xabarnoma muvaffaqiyatli yuborildi!" : "Qoralama saqlandi!");
      } else {
        alert(data.error || "Xabarnoma yuborishda xatolik");
      }
    } catch (err) {
      console.error("Send broadcast error:", err);
      alert("Xabarnoma yuborishda xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  // Preview replacement text
  const previewText = messageBody
    .replace(/{{fullName}}/g, "Alisher Zokirov")
    .replace(/{{phone}}/g, "+998 90 123 45 67")
    .replace(/{{courseTitle}}/g, "Vibe Coding Express")
    .replace(/{{loginUrl}}/g, "https://vibecoding.uz/kabinet");

  const audienceLabels: Record<string, string> = {
    all_users: "Barcha foydalanuvchilar",
    active_students: "Faol talabalar",
    leads_new: "Yangi leadlar (Quiz)",
    leads_consultation: "Konsultatsiyadagilar",
    cohort_students: "Muayyan guruh talabalari",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
          <Send className="w-6 h-6 text-accent" />
          Ommaviy Xabarnomalar (Broadcast Composer)
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Telegram bot, Email va SMS orqali talabalar va leadlarga maqsadli (targeted) bildirishnomalar yuborish.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Broadcast Composer */}
        <div className="lg:col-span-7 bg-cream-warm border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-base font-bold text-ink border-b border-border pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Yangi Xabarnoma Tuzish
          </h2>

          {/* Broadcast Title */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Xabarnoma Nomi (Ichki foydalanish uchun) *</label>
            <input
              type="text"
              placeholder="Masalan: Vibe Coding 3-modul darsi eslatmasi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-medium text-ink mb-2">Yuborish Kanali *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setChannel("telegram")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  channel === "telegram"
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-cream text-ink border-border hover:bg-cream-deep"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Telegram
              </button>

              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  channel === "email"
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-cream text-ink border-border hover:bg-cream-deep"
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>

              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  channel === "sms"
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-cream text-ink border-border hover:bg-cream-deep"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                SMS
              </button>

              <button
                type="button"
                onClick={() => setChannel("all")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  channel === "all"
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-cream text-ink border-border hover:bg-cream-deep"
                }`}
              >
                <Layers className="w-4 h-4" />
                Barchasi
              </button>
            </div>
          </div>

          {/* Target Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Maqsadli Auditoriya *</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all_users">Barcha foydalanuvchilar</option>
                <option value="active_students">Faol talabalar</option>
                <option value="cohort_students">Muayyan guruh talabalari</option>
                <option value="leads_new">Yangi leadlar (Quiz topshirganlar)</option>
                <option value="leads_consultation">Konsultatsiyadagilar</option>
              </select>
            </div>

            {targetAudience === "cohort_students" && (
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Guruhni Tanlang *</label>
                <select
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Guruhni tanlang...</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Variable Insertion Chips */}
          <div>
            <span className="block text-xs font-medium text-ink mb-1.5">Dinamik O'zgaruvchilar (Kliklang):</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { tag: "{{fullName}}", label: "Talaba Ismi" },
                { tag: "{{phone}}", label: "Telefon" },
                { tag: "{{courseTitle}}", label: "Kurs Nomi" },
                { tag: "{{loginUrl}}", label: "Kabinet Linki" },
              ].map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => insertVariable(item.tag)}
                  className="px-2.5 py-1 rounded-md text-xs bg-accent-soft text-accent border border-accent-line hover:bg-accent hover:text-white transition-all font-mono"
                >
                  + {item.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Message Body Textarea */}
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Xabar Matni *</label>
            <textarea
              rows={6}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Xabarnoma matnini kiriting..."
              className="w-full px-4 py-3 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sans"
            />
            <div className="flex justify-between items-center text-[11px] text-ink-muted mt-1">
              <span>Harlar soni: {messageBody.length} ta</span>
              {channel === "sms" && (
                <span>SMS segmenti: {Math.ceil(messageBody.length / 160) || 1} ta SMS</span>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              disabled={sending}
              onClick={() => handleSendBroadcast("draft")}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
            >
              Qoralama Saqlash
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={() => handleSendBroadcast("sent")}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50 gap-2"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Hozir Yuborish
            </button>
          </div>
        </div>

        {/* Right Column: Live Device Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-cream-warm border border-border rounded-xl p-5 space-y-4 sticky top-20">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center justify-between border-b border-border pb-2">
              <span>Jonli Ko'rinish (Live Device Preview)</span>
              <span className="text-[10px] text-accent font-mono bg-accent-soft px-2 py-0.5 rounded">
                {channel.toUpperCase()}
              </span>
            </h3>

            {/* Telegram Device Preview Card */}
            {(channel === "telegram" || channel === "all") && (
              <div className="bg-[#0e1621] text-white rounded-2xl p-4 shadow-md font-sans text-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-bold text-white text-xs">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-white">Mirzo Academy Bot</div>
                    <div className="text-[10px] text-gray-400">rasmiy bildirishnoma bot</div>
                  </div>
                </div>
                <div className="bg-[#182533] p-3 rounded-xl rounded-tl-none border border-gray-700/50 text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {previewText}
                  <div className="text-[9px] text-gray-400 text-right mt-1">19:42 ✓✓</div>
                </div>
              </div>
            )}

            {/* SMS Preview Card */}
            {channel === "sms" && (
              <div className="bg-gray-100 text-ink rounded-2xl p-4 shadow-md text-xs space-y-2 border border-gray-300">
                <div className="flex items-center justify-between text-gray-500 text-[10px] border-b pb-1">
                  <span>SMS (MirzoAcademy)</span>
                  <span>Hozir</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 text-ink leading-relaxed whitespace-pre-wrap">
                  {previewText}
                </div>
              </div>
            )}

            {/* Email Preview Card */}
            {channel === "email" && (
              <div className="bg-white text-ink rounded-xl p-4 shadow-md text-xs space-y-3 border border-border">
                <div className="border-b border-gray-100 pb-2 space-y-1">
                  <div className="text-gray-500">
                    Kimdan: <span className="text-ink font-medium">info@academy.mirzo.uz</span>
                  </div>
                  <div className="text-gray-500">
                    Mavzu: <span className="text-ink font-bold">{title || "Mirzo Academy Bildirishnoma"}</span>
                  </div>
                </div>
                <div className="text-ink leading-relaxed whitespace-pre-wrap pt-1">{previewText}</div>
              </div>
            )}

            <div className="p-3 bg-cream border border-border rounded-lg flex items-start gap-2 text-xs text-ink-muted">
              <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>
                Auditoriya bo'yicha taxminiy target: <strong>{audienceLabels[targetAudience]}</strong>.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-ink flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Yuborilgan Xabarnomalar Tarixi
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="text-center py-10 bg-cream-warm rounded-xl border border-border text-xs text-ink-muted">
            Hali yuborilgan xabarnomalar mavjud emas.
          </div>
        ) : (
          <div className="bg-cream-warm border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream-deep border-b border-border text-xs uppercase text-ink-muted font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Nomi</th>
                    <th className="px-4 py-3.5">Kanal</th>
                    <th className="px-4 py-3.5">Auditoriya</th>
                    <th className="px-4 py-3.5">Qabul qiluvchilar</th>
                    <th className="px-4 py-3.5">Holat</th>
                    <th className="px-4 py-3.5">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {broadcasts.map((b) => (
                    <tr key={b.id} className="hover:bg-cream/60 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-ink max-w-xs truncate">{b.title}</td>
                      <td className="px-4 py-3.5 uppercase text-xs font-bold text-accent font-mono">{b.channel}</td>
                      <td className="px-4 py-3.5 text-xs text-ink-muted">
                        {audienceLabels[b.targetAudience] || b.targetAudience}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-ink">{b.recipientsCount} ta</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            b.status === "sent"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {b.status === "sent" ? "Yuborilgan" : "Qoralama"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
