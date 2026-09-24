import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui";

export function KabinetPageHeader({ title, description, icon: Icon }: { title: string; description: string; icon?: LucideIcon }) {
  return (
    <header className="max-w-3xl">
      <div className="flex items-center gap-3">
        {Icon ? <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><Icon className="h-5 w-5" aria-hidden="true" /></span> : null}
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink md:text-3xl">{title}</h1>
      </div>
      <p className="mt-3 text-base leading-relaxed text-ink-muted md:text-[17px]">{description}</p>
    </header>
  );
}

export function KabinetSkeleton({ label, rows = 2 }: { label: string; rows?: number }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-xl border border-border bg-bg-sunken" />
      ))}
    </div>
  );
}

export function KabinetState({ title, description, action, tone = "empty" }: { title: string; description: string; action?: { label: string; href: string }; tone?: "empty" | "error" }) {
  return (
    <section role={tone === "error" ? "alert" : undefined} className={`rounded-xl border p-6 md:p-8 ${tone === "error" ? "border-danger bg-bg-elevated" : "border-dashed border-border-strong bg-bg-elevated"}`}>
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted">{description}</p>
      {action ? <Button href={action.href} className="mt-5">{action.label}</Button> : null}
    </section>
  );
}
