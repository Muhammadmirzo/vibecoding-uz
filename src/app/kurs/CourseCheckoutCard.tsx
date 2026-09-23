"use client";

import Link from "next/link";
import { ArrowRight, Check, CirclePlay, Send, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourseCtaState } from "./cta";

interface CourseCheckoutCardProps {
  price: string;
  oldPrice: string;
  installment: string;
  sessionFormat: string;
  guaranteeText: string;
}

export function CourseCheckoutCard({ price, oldPrice, installment, sessionFormat, guaranteeText }: CourseCheckoutCardProps) {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const ctaState = getCourseCtaState({ isAuthenticated: Boolean(user), hasConfiguredProvider: true });

  const handlePrimaryCta = () => {
    if (ctaState === "login") {
      openAuthModal("login");
    } else if (ctaState === "checkout") {
      router.push("/kabinet/to-lovlar");
    }
  };

  return (
    <div className="sticky top-24 bg-[var(--color-cream-warm)] border-2 border-[var(--color-accent)] rounded-[var(--radius-xl)] p-7 space-y-6 shadow-[var(--shadow-lg)]">
      <div className="space-y-1">
        {oldPrice !== price && <div className="text-xs font-mono font-bold text-[var(--color-ink-subtle)] line-through">{oldPrice}</div>}
        <div className="text-3xl font-extrabold text-[var(--color-ink)]">{price}</div>
        <div className="text-xs font-mono text-[var(--color-accent)] font-semibold">Bo&apos;lib to&apos;lash: {installment}</div>
      </div>
      <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-accent)]">Narxga nima kiradi?</h3>
        <div className="space-y-2.5">
          {[sessionFormat, "Telegram bot orqali uy vazifalari tekshiruvi", "Mirzodan shaxsiy feedback", "Bitiruv sertifikati", guaranteeText].map((item, index) => (
            <div key={index} className="flex items-start gap-2.5 text-xs font-medium text-[var(--color-ink)]">
              <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" /><span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <button type="button" onClick={handlePrimaryCta} className="btn-primary h-12 min-h-[48px] px-6 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center justify-center gap-2 w-full whitespace-nowrap active:scale-[0.98] transition-transform">
          {ctaState === "login" ? "Kursga o'tish uchun kiring" : "Kursni band qilish"}
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] leading-relaxed text-[var(--color-ink-muted)]">To&apos;lov oynasi Telegram orqali emas, shu sahifada ochiladi.</p>
        <a href="https://t.me/m/ODAfK_QIMjky" target="_blank" rel="noreferrer" className="btn-secondary h-12 px-6 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center justify-center gap-2 w-full">
          <Send className="w-4 h-4 text-[var(--color-accent)]" /> Telegram orqali maslahat
        </a>
        <Link href="/bepul-dars" prefetch className="block">
          <button type="button" className="btn-secondary h-12 px-6 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center justify-center gap-2 w-full">
            <CirclePlay className="w-4 h-4 text-[var(--color-accent)]" /> Bepul darsni ko&apos;rish
          </button>
        </Link>
      </div>
      <div className="p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cream)] font-mono text-xs text-[var(--color-ink-muted)] text-center">To&apos;lov: Payme · Click · bo&apos;lib to&apos;lash</div>
      <div className="flex items-center gap-2 text-[11px] text-[var(--color-ink-muted)] pt-2 border-t border-[var(--color-border)]"><ShieldCheck className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" /><span>Click va Payme orqali xavfsiz to&apos;lov</span></div>
    </div>
  );
}
