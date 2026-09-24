"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  CreditCard,
  Gift,
  LayoutDashboard,
  Menu,
  Settings,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  exact?: boolean;
};

const primaryItems: NavItem[] = [
  { href: "/kabinet", label: "Bosh sahifa", shortLabel: "Bosh sahifa", icon: LayoutDashboard, exact: true },
  { href: "/kabinet/kurs/vibe-coding-express", label: "Kurs va darslar", shortLabel: "Kurs", icon: BookOpen },
  { href: "/kabinet/baholar", label: "Baholar", shortLabel: "Baholar", icon: Award, exact: true },
  { href: "/kabinet/to-lovlar", label: "To'lovlar", shortLabel: "To'lovlar", icon: CreditCard, exact: true },
];

const utilityItems: NavItem[] = [
  { href: "/kabinet/referral", label: "Taklif dasturi", shortLabel: "Bonus", icon: Gift, exact: true },
  { href: "/kabinet/sozlamalar", label: "Sozlamalar", shortLabel: "Sozlamalar", icon: Settings, exact: true },
];

function isItemActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function NavigationLink({ item, active, compact = false, onNavigate }: { item: NavItem; active: boolean; compact?: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${
        active
          ? "bg-brand-soft text-brand"
          : "text-ink-muted hover:bg-bg-sunken hover:text-ink"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className={compact ? "sr-only" : undefined}>{item.label}</span>
    </Link>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/kabinet" onClick={onNavigate} className="mb-8 flex min-h-11 items-center gap-3 px-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-bg-elevated">VC</span>
        <span><span className="block font-display text-base font-semibold text-ink">Kabinet</span><span className="block text-xs text-ink-muted">O&apos;quvchi zonasi</span></span>
      </Link>
      <nav aria-label="Kabinet navigatsiyasi" className="space-y-1">
        {primaryItems.map((item) => <NavigationLink key={item.href} item={item} active={isItemActive(pathname, item)} onNavigate={onNavigate} />)}
      </nav>
      <div className="my-5 border-t border-border" />
      <nav aria-label="Kabinet xizmatlari" className="space-y-1">
        {utilityItems.map((item) => <NavigationLink key={item.href} item={item} active={isItemActive(pathname, item)} onNavigate={onNavigate} />)}
      </nav>
      <p className="mt-auto px-3 text-xs leading-relaxed text-ink-subtle">Faol ma&apos;lumot tizimda ko&apos;rsatiladi.</p>
    </div>
  );
}

export function KabinetNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mobileItems = [primaryItems[0], primaryItems[1], primaryItems[3], utilityItems[1]];

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-bg-elevated px-5 py-6 lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg-elevated/95 px-4 backdrop-blur md:h-[72px] md:px-6 lg:hidden">
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Trigger asChild>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-lg text-ink-muted hover:bg-bg-sunken hover:text-ink" aria-label="Kabinet menyusini ochish">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(86vw,320px)] border-r border-border bg-bg-elevated p-5 shadow-2xl">
              <Dialog.Title className="sr-only">Kabinet menyusini ochish</Dialog.Title>
              <Dialog.Close className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-lg text-ink-muted hover:bg-bg-sunken" aria-label="Menyuni yopish">
                <X className="h-5 w-5" aria-hidden="true" />
              </Dialog.Close>
              <SidebarContent pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <Link href="/kabinet" className="flex min-h-11 items-center gap-2 font-display text-base font-semibold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-ink text-xs text-bg-elevated">VC</span>Kabinet
        </Link>
        <span className="w-11" aria-hidden="true" />
      </div>

      <nav aria-label="Mobil navigatsiya" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-bg-elevated/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {mobileItems.map((item) => {
          const active = isItemActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold ${active ? "text-brand" : "text-ink-muted"}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
