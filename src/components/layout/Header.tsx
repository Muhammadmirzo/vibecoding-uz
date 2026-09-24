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

export { Footer } from "./Footer";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  if (pathname?.startsWith("/admin")) return null;
  return <><SiteBanner /><header className="sticky top-0 z-50 border-b border-border/80 bg-bg/85 backdrop-blur-xl"><div className="mx-auto flex min-h-16 w-full max-w-container items-center gap-4 px-5 sm:px-8"><Brand /><DesktopNav /><div className="ml-auto flex items-center gap-1.5"><Link href="/diagnostika" className="hidden rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-gold-hover sm:inline-flex">Bepul diagnostika</Link><ThemeToggle /><UserMenu /><MobileDrawer open={menuOpen} onOpenChange={setMenuOpen} /></div></div></header></>;
}
