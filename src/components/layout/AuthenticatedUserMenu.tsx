"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CreditCard, LayoutDashboard, LogOut, Settings, Share2 } from "lucide-react";
import type { User } from "@/lib/validations/auth";

const menuLinkClass = "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-bg-sunken focus:outline-none";

export function AuthenticatedUserMenu({ user, logout }: { user: User; logout: () => Promise<void> }) {
  const items = [
    { href: "/kabinet", label: "Shaxsiy kabinet", Icon: LayoutDashboard },
    { href: "/kabinet/to-lovlar", label: "To'lovlar & Cheklar", Icon: CreditCard },
    { href: "/kabinet/referral", label: "Referral & Bonus", Icon: Share2 },
    { href: "/kabinet/sozlamalar", label: "Profil sozlamalari", Icon: Settings },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 md:flex" title={user.fullName} aria-label="Foydalanuvchi menyusi">
          {getUserInitials(user.fullName)}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className="z-50 mt-1 w-56 rounded-xl border border-border bg-bg-elevated p-1.5 shadow-lg">
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
          <DropdownMenu.Item onClick={() => void logout()} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-red-500/10 focus:outline-none dark:text-red-400">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Chiqish
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function getUserInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "U";
}
