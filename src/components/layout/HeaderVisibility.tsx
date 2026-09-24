"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function HeaderVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname?.startsWith("/admin") ? null : children;
}
