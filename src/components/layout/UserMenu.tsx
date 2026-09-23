"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CreditCard, LayoutDashboard, LogIn, LogOut, Settings, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/lib/validations/auth";

export function getUserInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "U";
}

const menuLinkClass = "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-cream-warm focus:outline-none";

export function UserMenu() {
  const { user, isLoading, openAuthModal, logout } = useAuth();

  if (isLoading) return <div className="hidden h-10 w-10 shrink-0 animate-pulse rounded-full bg-cream-warm md:block" aria-label="Profil yuklanmoqda" />;
  if (!user) {
    return (
      <button type="button" onClick={() => openAuthModal("login")} className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-cream-warm text-ink transition-colors hover:bg-cream-deep md:flex" title="Tizimga kirish" aria-label="Tizimga kirish">
        <LogIn className="h-4 w-4 text-accent" aria-hidden="true" />
      </button>
    );
  }
  return <AuthenticatedMenu user={user} logout={logout} />;
}

function AuthenticatedMenu({ user, logout }: { user: User; logout: () => Promise<void> }) {
  const items = [
    { href: "/kabinet", label: "Shaxsiy kabinet", Icon: LayoutDashboard },
    { href: "/kabinet/to-lovlar", label: "To'lovlar & Cheklar", Icon: CreditCard },
    { href: "/kabinet/referral", label: "Referral & Bonus", Icon: Share2 },
    { href: "/kabinet/sozlamalar", label: "Profil sozlamalari", Icon: Settings },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 md:flex" title={user.fullName} aria-label="Foydalanuvchi menyusi">
          {getUserInitials(user.fullName)}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className="z-50 mt-1 w-56 rounded-xl border border-border bg-cream p-1.5 shadow-lg">
          <div className="mb-1 border-b border-border px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
            <p className="font-mono text-xs text-ink-muted">{user.phone}</p>
          </div>
          {items.map(({ href, label, Icon }) => (
            <DropdownMenu.Item key={href} asChild>
              <Link href={href} prefetch className={menuLinkClass}><Icon className="h-4 w-4 text-accent" aria-hidden="true" />{label}</Link>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item onClick={() => void logout()} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10 focus:outline-none dark:text-red-400">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Chiqish
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
