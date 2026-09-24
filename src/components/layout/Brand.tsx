import Link from "next/link";

export function Brand() {
  return <Link href="/" prefetch className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold tracking-tight text-ink" aria-label="VibeCoding.uz bosh sahifa"><span className="flex size-8 items-center justify-center rounded-lg bg-gold font-mono text-base text-ink" aria-hidden="true">&gt;</span><span>vibe<span className="text-brand">coding</span></span></Link>;
}
