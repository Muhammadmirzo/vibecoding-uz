"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, CirclePlay, LogIn, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { courseLinks, resourceLinks, type NavItem } from "./headerData";
import { getUserInitials } from "./UserMenu";

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ctaText: string;
  ctaLink: string;
}

function DrawerLink({ item, close }: { item: NavItem; close: () => void }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} prefetch onClick={close} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-cream-warm">
      <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <span>{item.title}</span>
    </Link>
  );
}

export function MobileDrawer({ open, onOpenChange, ctaText, ctaLink }: MobileDrawerProps) {
  const { user, logout, openAuthModal } = useAuth();
  const close = () => onOpenChange(false);
  const login = () => {
    close();
    openAuthModal("login");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-cream-warm)] lg:hidden" aria-label={open ? "Navigatsiyani yopish" : "Navigatsiyani ochish"}>
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className="max-h-[calc(100dvh-4rem)] space-y-3 overflow-y-auto border-b border-[var(--color-border)] bg-[var(--color-cream)] px-5 py-4 shadow-[var(--shadow-lg)] lg:hidden" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">Mobil navigatsiya</Dialog.Title>
          {user ? (
            <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cream-warm)] p-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-bold text-[var(--color-ink)]">{user.fullName}</p><p className="font-mono text-xs text-[var(--color-ink-muted)]">{user.phone}</p></div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">{getUserInitials(user.fullName)}</div>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2">
                <Link href="/kabinet" onClick={close} className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)]">Kabinetga o&apos;tish</Link>
                <button type="button" onClick={() => { close(); void logout(); }} className="flex items-center gap-1 text-xs font-semibold text-red-500"><LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Chiqish</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={login} className="btn-secondary flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] py-2.5 text-sm font-semibold">
              <LogIn className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" /> Tizimga kirish
            </button>
          )}
          <div className="space-y-4 border-t border-[var(--color-border)] pt-2">
            <div className="space-y-1"><p className="mb-1 px-1 font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Kurslar</p>{courseLinks.map((item) => <DrawerLink key={item.href} item={item} close={close} />)}</div>
            <div className="space-y-1"><p className="mb-1 px-1 font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Asosiy</p>
              <Link href="/bepul-dars" onClick={close} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-accent)]"><CirclePlay className="h-4 w-4" aria-hidden="true" />Bepul dars</Link>
              <Link href="/xizmatlar" onClick={close} className="block rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)]">Xizmatlar</Link>
              <Link href="/meetlar" onClick={close} className="block rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)]">Meetlar</Link>
              <Link href="/testimoniyalar" onClick={close} className="block rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)]">Ekspertlar</Link>
            </div>
            <div className="space-y-1"><p className="mb-1 px-1 font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Resurslar</p>{resourceLinks.slice(0, 3).map((item) => <DrawerLink key={item.href} item={item} close={close} />)}</div>
            <Link href={ctaLink} onClick={close} className="btn-primary block w-full rounded-[var(--radius-md)] py-3 text-center text-sm font-semibold shadow-sm">{ctaText}</Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
