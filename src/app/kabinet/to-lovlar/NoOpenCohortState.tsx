import Link from "next/link";
import { CalendarClock, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NoOpenCohortStateProps {
  courseTitle: string;
  courseSlug: string;
  /** `unavailable` = the check itself failed; `no-cohort` = nothing is open yet. */
  reason: "no-cohort" | "unavailable";
  nextCohortDate?: string;
}

/**
 * No pay button without an open cohort (honesty rule: never offer a payment we
 * cannot price). The student gets the real next step instead — the Telegram
 * waitlist, which is a person, not a checkout.
 */
export function NoOpenCohortState({
  courseTitle,
  courseSlug,
  reason,
  nextCohortDate,
}: NoOpenCohortStateProps) {
  const unavailable = reason === "unavailable";
  return (
    <section
      className="rounded-2xl border border-border bg-bg-elevated p-6 md:p-8"
      data-checkout-target={unavailable ? "unavailable" : "waitlist"}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <CalendarClock className="mt-0.5 h-7 w-7 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <p className="font-mono text-xs font-bold uppercase text-accent">Kurs</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{courseTitle}</h2>
        </div>
      </div>
      <p className="mt-4 text-base leading-relaxed text-ink">
        {unavailable
          ? "To'lovni tayyorlash vaqtincha imkonsiz. Birozdan keyin qayta urinib ko'ring."
          : "Keyingi guruh hali ochilmagan — Telegram orqali navbatga yoziling"}
      </p>
      {!unavailable && nextCohortDate ? (
        <p className="mt-2 text-sm text-ink-muted">
          Keyingi guruh rejalashtirilgan sana: <strong className="text-ink">{nextCohortDate}</strong>
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href="https://t.me/m/ODAfK_QIMjky" target="_blank" rel="noopener noreferrer">
            <Send className="h-4 w-4" aria-hidden="true" /> Telegram orqali navbatga yozish
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
          <Link href={`/kurs/${courseSlug}`}>Kurs sahifasini ko&apos;rish</Link>
        </Button>
      </div>
    </section>
  );
}
