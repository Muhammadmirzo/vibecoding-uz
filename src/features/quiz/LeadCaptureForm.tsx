import * as React from "react";
import { ArrowLeft, ArrowRight, Loader2, Phone, User } from "lucide-react";

interface LeadCaptureFormProps {
  name: string;
  phone: string;
  loading: boolean;
  errorMessage: string | null;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPrevious: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function LeadCaptureForm({
  name,
  phone,
  loading,
  errorMessage,
  headingRef,
  onNameChange,
  onPhoneChange,
  onPrevious,
  onSubmit,
}: LeadCaptureFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-[var(--color-ink)] focus:outline-none"
        >
          Natijani olish uchun ma&apos;lumotlarni kiriting
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Shaxsiy tavsiya va bepul darsga kirish havolasi ko&apos;rsatiladi.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="quiz-name" className="mb-1.5 block text-xs font-mono font-bold uppercase text-[var(--color-ink)]">
            Ismingiz
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-5 w-5 text-[var(--color-ink-subtle)]" />
            <input
              id="quiz-name"
              type="text"
              required
              autoComplete="name"
              placeholder="Ismingizni kiriting"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] pl-11 pr-4 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="quiz-phone" className="mb-1.5 block text-xs font-mono font-bold uppercase text-[var(--color-ink)]">
            Telefon raqamingiz (Telegram)
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-[var(--color-ink-subtle)]" />
            <input
              id="quiz-phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] pl-11 pr-4 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4">
        <button type="button" onClick={onPrevious} disabled={loading} className="btn-secondary inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </button>
        <button type="submit" disabled={loading} className="btn-primary inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] px-8 text-sm font-semibold">
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saqlanmoqda...</>
          ) : errorMessage ? (
            <>Qayta urinish <ArrowRight className="h-4 w-4" /></>
          ) : (
            <>Natijani ko&apos;rish <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </form>
  );
}
