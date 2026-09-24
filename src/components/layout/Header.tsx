"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./Brand";
import { DesktopNav } from "./DesktopNav";
import { MobileDrawer } from "./MobileDrawer";
import { SiteBanner } from "./SiteBanner";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useScrolled } from "@/features/motion/ui/useScrolled";
import { cn } from "@/components/ui/utils";

export { Footer } from "./Footer";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const scrolled = useScrolled();
  if (pathname?.startsWith("/admin")) return null;
  return <><SiteBanner /><header className={cn("site-header sticky top-0 z-50 border-b border-border/80 bg-bg/90 backdrop-blur-xl", scrolled && "is-scrolled")}><div className="mx-auto flex min-h-16 w-full max-w-container items-center gap-3 px-4 sm:px-8"><Brand /><DesktopNav /><div className="ml-auto flex items-center gap-1.5"><Link href="/diagnostika" className="btn-press hidden min-h-11 items-center rounded-lg bg-gold px-4 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-gold-hover sm:inline-flex">Bepul diagnostika</Link><ThemeToggle /><UserMenu /><MobileDrawer open={menuOpen} onOpenChange={setMenuOpen} /></div></div></header></>;
}
