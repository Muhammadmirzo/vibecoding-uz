"use client";

import dynamic from "next/dynamic";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AuthenticatedUserMenu = dynamic(
  () => import("./AuthenticatedUserMenu").then((mod) => mod.AuthenticatedUserMenu),
  { ssr: false },
);

export function getUserInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "U";
}

export function UserMenu() {
  const { user, openAuthModal, logout } = useAuth();

  if (!user) {
    return (
      <button type="button" onClick={() => openAuthModal("login")} className="hidden min-h-11 items-center gap-2 rounded-lg border border-border-strong bg-bg-elevated px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand md:flex">
        <LogIn className="size-4 text-accent" aria-hidden="true" />Kirish
      </button>
    );
  }
  return <AuthenticatedUserMenu user={user} logout={logout} />;
}
