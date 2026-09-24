"use client";

import type { ReactNode } from "react";
import { useScrolled } from "@/features/motion/ui/useScrolled";
import { cn } from "@/components/ui/utils";

export function HeaderShell({ children }: { children: ReactNode }) {
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-50 border-b border-border bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] backdrop-blur-xl",
        scrolled && "is-scrolled",
      )}
    >
      <div className="mx-auto flex min-h-16 w-full max-w-container items-center gap-3 px-4 sm:px-8">
        {children}
      </div>
    </header>
  );
}
