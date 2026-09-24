import Link from "next/link";

const links = [["Kurslar", "/#kurs-tanlash"], ["Xizmatlar", "/xizmatlar"], ["Portfolio", "/portfolio"], ["Blog", "/blog"], ["Resurslar", "/resurslar"]] as const;

export function DesktopNav() {
  return <nav aria-label="Asosiy navigatsiya" className="hidden items-center gap-1 lg:flex">{links.map(([label, href]) => <Link key={href} href={href} prefetch className="link-underline inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold text-ink-muted transition-colors hover:bg-bg-sunken hover:text-ink">{label}</Link>)}</nav>;
}
