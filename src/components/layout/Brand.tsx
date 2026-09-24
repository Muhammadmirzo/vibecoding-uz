import Link from "next/link";

export function Brand() {
  return <Link href="/" prefetch className="flex min-h-11 shrink-0 items-center gap-2 rounded-md px-1 font-display text-base font-semibold tracking-tight text-ink sm:text-lg" aria-label="VibeCoding.uz bosh sahifa"><span className="flex size-8 items-center justify-center rounded-lg bg-gold font-mono text-base text-ink" aria-hidden="true">&gt;</span><span className="hidden min-[360px]:inline">vibe<span className="text-brand">coding</span></span></Link>;
}
