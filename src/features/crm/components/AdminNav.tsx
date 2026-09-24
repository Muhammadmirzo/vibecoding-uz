"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  CheckSquare,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Send,
  Settings,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const navItems: NavItem[] = [
  { href: "/admin", label: "Boshqaruv paneli", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Leadlar", icon: BarChart3 },
  { href: "/admin/cohorts", label: "Guruhlar", icon: GraduationCap },
  { href: "/admin/homework", label: "Uy vazifalari", icon: CheckSquare },
  { href: "/admin/blog", label: "Maqolalar", icon: FileText },
  { href: "/admin/portfolio", label: "Portfoliolar", icon: Briefcase },
  { href: "/admin/notifications", label: "Xabarnomalar", icon: Send },
  { href: "/admin/students", label: "Talabalar", icon: Users },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/analytics", label: "Analitika", icon: BarChart3 },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
];

function Brand() {
  return (
    <Link href="/admin" className="flex min-h-11 items-center gap-3 rounded-lg px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand"><ShieldCheck className="h-5 w-5" /></span>
      <span><span className="block font-display text-sm font-semibold text-ink">Mirzo Academy</span><span className="block text-xs text-ink-muted">Boshqaruv markazi</span></span>
    </Link>
  );
}

function Navigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin bo'limlari" className="space-y-1">
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${active ? "bg-brand-soft text-brand" : "text-ink-muted hover:bg-bg-sunken hover:text-ink"}`}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-border bg-bg-elevated px-4 py-5 lg:flex">
        <Brand />
        <div className="my-5 border-t border-border" />
        <div className="flex-1 overflow-y-auto"><Navigation pathname={pathname} /></div>
        <Link href="/" className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-bg-sunken hover:text-ink"><ArrowLeft className="h-4 w-4" />Saytga qaytish</Link>
      </aside>

      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Trigger asChild>
          <button type="button" className="fixed inset-x-3 top-3 z-40 flex min-h-12 items-center justify-between rounded-xl border border-border bg-bg-elevated px-4 shadow-lg lg:hidden" aria-label="Menyuni ochish"><span className="font-display text-sm font-semibold text-ink">CRM boshqaruv</span><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand"><Menu className="h-5 w-5" /></span></button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex max-h-[100dvh] w-[min(88vw,20rem)] flex-col overflow-y-auto overscroll-contain bg-bg-elevated p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl lg:hidden">
            <Dialog.Title className="sr-only">Navigatsiya</Dialog.Title>
            <div className="flex items-center justify-between"><Brand /><Dialog.Close className="grid h-11 w-11 place-items-center rounded-xl text-ink-muted hover:bg-bg-sunken" aria-label="Menyuni yopish"><X className="h-5 w-5" /></Dialog.Close></div>
            <div className="my-4 border-t border-border" />
            <div className="flex-1 overflow-y-auto"><Navigation pathname={pathname} onNavigate={() => setDrawerOpen(false)} /></div>
            <Dialog.Close asChild><Link href="/" className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-ink-muted"><ArrowLeft className="h-4 w-4" />Saytga qaytish</Link></Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
