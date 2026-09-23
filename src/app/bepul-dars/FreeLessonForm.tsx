"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Loader2, BookOpen, Send } from "lucide-react";

type ApiErrorBody = {
  error?: string;
  details?: { fieldErrors?: Record<string, string[]> };
};

export function FreeLessonForm() {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const formatPhoneMask = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    const localDigits = digits.startsWith("998") ? digits.slice(3) : digits;
    const limited = localDigits.slice(0, 9);
    let formatted = "+998";
    if (limited.length > 0) formatted += " " + limited.slice(0, 2);
    if (limited.length > 2) formatted += " " + limited.slice(2, 5);
    if (limited.length > 5) formatted += "-" + limited.slice(5, 7);
    if (limited.length > 7) formatted += "-" + limited.slice(7, 9);
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMsg) setErrorMsg(null);
    const raw = e.target.value;
    if (raw.trimStart().startsWith("@")) {
      setPhone(raw.replace(/\s/g, "").slice(0, 33));
      return;
    }
    if (raw.trim() === "") {
      setPhone("");
      return;
    }
    setPhone(formatPhoneMask(raw));
  };

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const isUsername = trimmedPhone.startsWith("@");
  const phoneDigits = trimmedPhone.replace(/\D/g, "");
  const isPhoneValid =
    !isUsername && phoneDigits.length === 12 && phoneDigits.startsWith("998");
  const isUsernameValid = isUsername && trimmedPhone.length >= 4;
  const isContactValid = isPhoneValid || isUsernameValid;
  const isFormValid = trimmedName.length >= 2 && isContactValid;

  const phoneHint = isUsername
    ? isUsernameValid ? "Telegram username qabul qilinadi." : "Telegram username kiriting: @ dan keyin kamida 3 belgi."
    : phoneDigits.length === 0 ? "+998 XX XXX-XX-XX formatda yoki @username kiriting."
    : isPhoneValid ? "Raqam to'g'ri formatda." : `To'liq kiriting: +998 XX XXX-XX-XX (${phoneDigits.length}/12 raqam).`;

  const firstFieldError = (body: ApiErrorBody | null): string | null => {
    const fieldErrors = body?.details?.fieldErrors;
    if (!fieldErrors) return null;
    for (const messages of Object.values(fieldErrors)) {
      if (messages && messages.length > 0 && messages[0]) return messages[0];
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!isFormValid || loading) {
      if (trimmedName.length < 2) {
        setErrorMsg("Ismingizni kiriting (kamida 2 belgi).");
      } else if (!isContactValid) {
        setErrorMsg(
          "Telefon raqamni to'liq kiriting (+998 XX XXX-XX-XX) yoki Telegram username (@username)."
        );
      }
      return;
    }
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
        let data: ApiErrorBody | null = null;
        try {
          data = (await res.json()) as ApiErrorBody;
        } catch {
          data = null;
        }
        if (res.status === 429) {
          setErrorMsg(data?.error || "Juda ko'p urinish joylandi. Birozdan so'ng qayta urinib ko'ring.");
        } else if (res.status === 400) {
          setErrorMsg(
            firstFieldError(data) ||
              data?.error ||
              "Ma'lumotlarni tekshirib, qayta urinib ko'ring."
          );
        } else {
          setErrorMsg(data?.error || "Xatolik yuz berdi");
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
            <div role="alert" className="p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Bepul dars uchun ro'yxatdan o'tish shakli">
            <div>
              <label htmlFor="free-lesson-name" className="block text-xs font-mono font-bold text-[var(--color-ink)] mb-1 uppercase">
                Ismingiz
              </label>
              <input
                id="free-lesson-name"
                type="text"
                required
                minLength={2}
                placeholder="Ismingizni kiriting"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={trimmedName.length > 0 && trimmedName.length < 2}
                className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <div>
              <label htmlFor="free-lesson-phone" className="block text-xs font-mono font-bold text-[var(--color-ink)] mb-1 uppercase">
                Telefon raqam / Telegram
              </label>
              <input
                id="free-lesson-phone"
                type="tel"
                required
                placeholder="+998 90 123 45 67 yoki @username"
                value={phone}
                onChange={handlePhoneChange}
                aria-invalid={!isContactValid}
                aria-describedby="free-lesson-phone-hint"
                className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <p id="free-lesson-phone-hint" className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
                {phoneHint}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              aria-label="Bepul darsni ko'rishni boshlash"
              className="btn-primary h-12 min-h-[48px] px-8 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center justify-center gap-2 w-full whitespace-nowrap active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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
