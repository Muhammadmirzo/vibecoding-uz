"use client";

import Link from "next/link";
import { ArrowRight, Check, CirclePlay, Send, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
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
    <div className="rounded-xl border-2 border-accent bg-bg-elevated p-7 shadow-lg lg:sticky lg:top-24">
      <div className="space-y-1">
        {oldPrice !== price && (
          <p className="font-mono text-xs font-bold text-ink-subtle line-through">{oldPrice}</p>
        )}
        <p className="font-display text-3xl font-semibold text-ink">{price}</p>
        <p className="font-mono text-xs font-semibold text-accent">Bo&apos;lib to&apos;lash: {installment}</p>
      </div>
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-ink">
          Narxga nima kiradi?
        </h3>
        <ul className="space-y-2.5">
          {[sessionFormat, "Telegram bot orqali uy vazifalari tekshiruvi", "Mentordan shaxsiy fikr-mulohaza", "Bitiruv sertifikati", guaranteeText].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm font-medium text-ink">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3 pt-2">
        <Button onClick={handlePrimaryCta} size="lg" className="w-full">
          {ctaState === "login" ? "Kursga o'tish uchun kiring" : "Kursni band qilish"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <p className="text-sm leading-relaxed text-ink-muted">
          To&apos;lov oynasi shu sahifada ochiladi — hisobingizga kirgan bo'lishingiz kifoya.
        </p>
        <Button href="https://t.me/m/ODAfK_QIMjky" variant="secondary" className="w-full">
          <Send className="size-4 text-accent" aria-hidden="true" /> Telegram orqali maslahat
        </Button>
        <Link href="/bepul-dars" prefetch className="block">
          <Button variant="outline" className="w-full">
            <CirclePlay className="size-4 text-accent" aria-hidden="true" /> Bepul darsni ko&apos;rish
          </Button>
        </Link>
      </div>
      <p className="rounded-md border border-border bg-bg-sunken px-3 py-2 text-center font-mono text-xs text-ink-muted">
        To&apos;lov: Payme · Click · bo&apos;lib to&apos;lash
      </p>
      <p className="flex items-center gap-2 border-t border-border pt-3 text-sm text-ink-muted">
        <ShieldCheck className="size-4 shrink-0 text-accent" aria-hidden="true" />
        Click va Payme orqali xavfsiz to&apos;lov
      </p>
    </div>
  );
}
