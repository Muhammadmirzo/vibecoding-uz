"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Loader2, BookOpen, Send } from "lucide-react";

export function FreeLessonForm() {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("+998");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          source: "free_lesson",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 429) {
          setErrorMsg(data.error || "Juda ko'p urinish joylandi. Birozdan so'ng qayta urinib ko'ring.");
        } else {
          setErrorMsg(data.error || "Xatolik yuz berdi");
        }
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMsg("Tarmoqda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-lg)] space-y-6">
      {/* Lesson Details Info Card */}
      <div className="p-5 rounded-[var(--radius-lg)] bg-[var(--color-cream)] border border-[var(--color-border-strong)] space-y-3">
        <h3 className="text-sm font-bold font-mono text-[var(--color-ink)] uppercase tracking-wide flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
          Bu darsda nima bor?
        </h3>
        <ul className="space-y-2 text-xs text-[var(--color-ink-muted)]">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>AI agentlari yordamida 30 daqiqada MVP yaratish</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Claude Code va Cursor yordamida dasturchilarsiz ishlash</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span>Telegram bot va to'lov tizimlarini integratsiya qilish</span>
          </li>
        </ul>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[var(--color-ink)]">
              Darsga kirish muvaffaqiyatli tashkil etildi!
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Rahmat, <strong>{name}</strong>! Dars havolasi Telegram botda — quyidagi tugma orqali oching.
            </p>
          </div>
          <a
            href="https://t.me/m/ODAfK_QIMjky"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary h-12 px-6 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center justify-center gap-2 w-full mt-2"
          >
            <Send className="w-4 h-4" />
            Darsni Telegram botda olish
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[var(--color-ink)]">
              Bepul darsni hoziroq ko'ring
            </h2>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Telegram yoki telefon raqamingizni kiriting, darsga kirish havolasi ochiladi.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--color-ink)] mb-1 uppercase">
                Ismingiz
              </label>
              <input
                type="text"
                required
                placeholder="Ismingizni kiriting"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[var(--color-ink)] mb-1 uppercase">
                Telefon raqam / Telegram
              </label>
              <input
                type="tel"
                required
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-13 px-8 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center justify-center gap-2 w-full disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Yuborilmoqda...
                </>
              ) : (
                <>
                  Darsni ko'rishni boshlash
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
