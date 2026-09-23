"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headset, LayoutGrid } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Brand } from "./Brand";
import { DesktopNav } from "./DesktopNav";
import { MobileDrawer } from "./MobileDrawer";
import { SearchButton } from "./SearchButton";
import { SiteBanner } from "./SiteBanner";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { staticHeaderSettings, type HeaderSettings } from "./headerData";

export { Footer } from "./Footer";

function readSettings(value: unknown): HeaderSettings | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.success !== true || !record.settings || typeof record.settings !== "object") return null;
  return record.settings as HeaderSettings;
}

export const Header = React.memo(function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [siteSettings, setSiteSettings] = React.useState<HeaderSettings>(staticHeaderSettings);
  const { user } = useAuth();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (!isAdmin) return;
    const controller = new AbortController();
    fetch("/api/admin/settings", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data: unknown) => {
        const settings = readSettings(data);
        if (settings) setSiteSettings((current) => ({ ...current, ...settings }));
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to fetch admin header settings:", error);
        }
      });
    return () => controller.abort();
  }, [isAdmin]);

  if (isAdmin) return null;

  const settings = { ...staticHeaderSettings, ...siteSettings };

  return (
    <>
      {settings.enableAnnouncementBanner ? (
        <SiteBanner text={settings.announcementBannerText} link={settings.announcementBannerLink} />
      ) : null}
      <header className={`sticky left-0 right-0 top-0 z-50 border-b border-border bg-cream shadow-[var(--shadow-sm)] transition-all duration-200 ${scrolled ? "shadow-[var(--shadow-md)]" : ""}`}>
        <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between gap-2 px-3 sm:px-5 md:h-[72px] md:px-8">
          <div className="flex min-w-0 shrink-0 items-center gap-3 md:gap-5">
            <Brand />
            <DesktopNav />
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a href={settings.telegramBotLink} target="_blank" rel="noreferrer" className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/40 text-ink-muted transition-colors hover:bg-cream-warm hover:text-ink" title="Maslahat olish (Telegram)" aria-label="Telegram orqali maslahat olish">
              <Headset className="h-5 w-5 text-accent" aria-hidden="true" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-cream bg-success" aria-hidden="true" />
            </a>
            <SearchButton />
            <ThemeToggle />
            <Link href={user ? "/kabinet" : "/#kurs-tanlash"} prefetch className="hidden h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-cream px-3.5 text-xs font-semibold text-ink shadow-xs transition-all hover:bg-cream-warm sm:text-sm md:inline-flex">
              <LayoutGrid className="h-4 w-4 text-accent" aria-hidden="true" /> Dashboard
            </Link>
            <UserMenu />
          </div>
          <MobileDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} ctaText={settings.headerCtaText} ctaLink={settings.headerCtaLink} />
        </div>
      </header>
    </>
  );
});
