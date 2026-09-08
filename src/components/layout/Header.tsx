"use client";

import * as React from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import {
  BookOpen,
  CirclePlay,
  Headset,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  LogIn,
  Search,
  CreditCard,
  Share2,
  Settings,
} from "lucide-react";

export const Header = React.memo(function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [siteSettings, setSiteSettings] = React.useState<{
    headerCtaText?: string;
    headerCtaLink?: string;
    enrollmentUrl?: string;
    telegramBotLink?: string;
    announcementBannerText?: string;
    announcementBannerLink?: string;
    enableAnnouncementBanner?: boolean;
  }>({});

  const { user, isLoading, openAuthModal, logout } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSiteSettings(data.settings);
        }
      })
      .catch((err) => console.error("Failed to fetch settings in Header:", err));
  }, []);

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const ctaText = siteSettings.headerCtaText || "Kurs tanlash";
  const ctaLink = siteSettings.headerCtaLink || "/#kurs-tanlash";
  const tgLink = siteSettings.telegramBotLink || "https://t.me/m/ODAfK_QIMjky";
  const bannerText = siteSettings.announcementBannerText ?? "Yangi Vibe Coding Express guruhiga qabul boshlandi!";
  const bannerLink = siteSettings.announcementBannerLink ?? "/kurs/vibe-coding-express";
  const showBanner = siteSettings.enableAnnouncementBanner ?? true;

  return (
    <>
      {showBanner && bannerText && (
        <div className="bg-[var(--color-accent)] text-white text-xs font-semibold py-2 px-4 text-center z-[51] relative flex items-center justify-center gap-2">
          {bannerLink ? (
            <Link href={bannerLink} className="hover:underline inline-flex items-center gap-1">
              <span>{bannerText}</span>
              <ArrowRight className="w-3.5 h-3.5 inline" />
            </Link>
          ) : (
            <span>{bannerText}</span>
          )}
        </div>
      )}
      <header
        className="sticky top-0 left-0 right-0 z-50 bg-[var(--color-cream)] border-b border-[var(--color-border)] shadow-[var(--shadow-sm)] transition-all duration-200"
      >
        <div className="mx-auto w-full max-w-[1360px] px-4 md:px-6 lg:px-8 flex items-center justify-between gap-3 h-16 md:h-[72px]">
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-2 shrink-0 font-bold text-lg md:text-xl tracking-tight text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-md"
            >
              <span className="w-8 h-8 rounded-lg bg-[var(--color-accent)] text-white flex items-center justify-center font-mono text-base font-black shrink-0">
                M
              </span>
              <span className="font-extrabold tracking-tight text-base md:text-lg whitespace-nowrap">
                academy<span className="text-[var(--color-accent)]">.mirzo.uz</span>
              </span>
            </Link>

            {/* Desktop Navigation Links (Responsive Flex Layout) */}
            <nav className="hidden lg:flex items-center gap-1 shrink min-w-0">
              <div className="relative group shrink-0">
                <button className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[var(--radius-md)] text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] transition-colors whitespace-nowrap">
                  <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
                  Kurslar
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--color-ink-subtle)]" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-cream)] p-2 shadow-[var(--shadow-lg)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <Link
                    href="/kurs/vibe-coding-express"
                    prefetch={true}
                    className="block p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-cream-warm)] transition-colors"
                  >
                    <div className="text-sm font-semibold text-[var(--color-ink)]">Vibe Coding Express</div>
                    <div className="text-xs text-[var(--color-ink-muted)]">8 haftalik intensiv mentorlik</div>
                  </Link>
                  <Link
                    href="/kurs/ai-asoslari"
                    prefetch={true}
                    className="block p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-cream-warm)] transition-colors"
                  >
                    <div className="text-sm font-semibold text-[var(--color-ink)]">AI Asoslari</div>
                    <div className="text-xs text-[var(--color-ink-muted)]">Prompt-injiniring va AI vositalari</div>
                  </Link>
                </div>
              </div>

              <Link
                href="/bepul-dars"
                prefetch={true}
                className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-md)] px-3 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-soft)] whitespace-nowrap shrink-0"
              >
                <CirclePlay className="w-4 h-4" />
                Bepul dars
              </Link>

              <Link
                href="/meetlar"
                prefetch={true}
                className="inline-flex h-10 items-center rounded-[var(--radius-md)] px-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] transition-colors whitespace-nowrap shrink-0"
              >
                Meetlar
              </Link>

              <Link
                href="/blog"
                prefetch={true}
                className="inline-flex h-10 items-center rounded-[var(--radius-md)] px-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] transition-colors whitespace-nowrap shrink-0"
              >
                Blog
              </Link>

              <Link
                href="/testimoniyalar"
                prefetch={true}
                className="hidden xl:inline-flex h-10 items-center rounded-[var(--radius-md)] px-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] transition-colors whitespace-nowrap shrink-0"
              >
                Natijalar
              </Link>

              <Link
                href="/ish"
                prefetch={true}
                className="hidden xl:inline-flex h-10 items-center rounded-[var(--radius-md)] px-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] transition-colors whitespace-nowrap shrink-0"
              >
                Vakansiyalar
              </Link>

              <Link
                href="/resurslar"
                prefetch={true}
                className="hidden 2xl:inline-flex h-10 items-center rounded-[var(--radius-md)] px-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] transition-colors whitespace-nowrap shrink-0"
              >
                Resurslar
              </Link>
            </nav>
          </div>

          {/* Right CTA Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
            {/* Telegram Online Advice Headset */}
            <a
              href={tgLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] transition-colors relative shrink-0"
              title="Maslahat olish (Telegram)"
            >
              <Headset className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-success border border-cream"></span>
            </a>

            {/* Global Search Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-search-modal"))}
              className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-md text-ink-muted hover:text-ink hover:bg-cream-warm border border-border bg-cream-warm/50 transition-colors text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent shrink-0"
              title="Qidiruv (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-accent" />
              <span className="hidden 2xl:inline text-ink-muted">Qidirish...</span>
              <kbd className="hidden 2xl:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-cream border border-border rounded text-ink-muted">
                ⌘K
              </kbd>
            </button>

          {/* Theme Toggle (Light / Dark / Likely) */}
          <ThemeToggle />

          {/* User Auth Section */}
          {isLoading ? (
            <div className="h-10 w-20 rounded-md bg-cream-warm hidden md:block" />
          ) : user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="hidden md:inline-flex items-center gap-2 h-10 px-3 rounded-md bg-cream-warm hover:bg-cream-deep border border-border text-sm font-semibold text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-accent">
                  <div className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                    {getUserInitials(user.fullName)}
                  </div>
                  <span className="max-w-[100px] truncate">{user.fullName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-subtle" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-50 w-56 p-1.5 bg-cream border border-border rounded-lg shadow-lg"
                >
                  <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{user.fullName}</p>
                    <p className="text-xs text-[var(--color-ink-muted)] font-mono">{user.phone}</p>
                  </div>

                  <DropdownMenu.Item asChild>
                    <Link
                      href="/kabinet"
                      prefetch={true}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-cream-warm)] focus:outline-none cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[var(--color-accent)]" />
                      <span>Shaxsiy kabinet</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      href="/kabinet/to-lovlar"
                      prefetch={true}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-cream-warm)] focus:outline-none cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-[var(--color-accent)]" />
                      <span>To'lovlar & Cheklar</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      href="/kabinet/referral"
                      prefetch={true}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-cream-warm)] focus:outline-none cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-[var(--color-accent)]" />
                      <span>Referral & Bonus</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      href="/kabinet/sozlamalar"
                      prefetch={true}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[var(--color-ink)] rounded-[var(--radius-md)] hover:bg-[var(--color-cream-warm)] focus:outline-none cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[var(--color-ink-muted)]" />
                      <span>Profil sozlamalari</span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px bg-[var(--color-border)] my-1" />

                  <DropdownMenu.Item
                    onClick={() => logout()}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-[var(--radius-md)] hover:bg-red-500/10 focus:outline-none cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Chiqish</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="hidden md:inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-[var(--radius-md)] btn-secondary font-semibold text-sm transition-colors"
            >
              <LogIn className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Kirish</span>
            </button>
          )}

          {/* Primary CTA Button */}
          <a href={ctaLink} className="hidden md:inline-flex">
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium btn-primary h-10 px-5 text-sm">
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </button>
          </a>

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--color-border)] bg-[var(--color-cream)] px-5 py-4 space-y-3 shadow-[var(--shadow-lg)]">
          {/* Mobile Auth Button / User Card */}
          {user ? (
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-cream-warm)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--color-ink)]">{user.fullName}</p>
                  <p className="text-xs text-[var(--color-ink-muted)] font-mono">{user.phone}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center">
                  {getUserInitials(user.fullName)}
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                <Link
                  href={siteSettings.enrollmentUrl || "/kabinet"}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Kabinetga o'tish
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs font-semibold text-red-500 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Chiqish
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal("login");
              }}
              className="w-full py-2.5 rounded-[var(--radius-md)] btn-secondary text-sm font-semibold flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Tizimga kirish</span>
            </button>
          )}

          <Link
            href="/kurs/vibe-coding-express"
            prefetch={true}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-ink)]"
          >
            Vibe Coding Express
          </Link>
          <Link
            href="/bepul-dars"
            prefetch={true}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-accent)] flex items-center gap-2"
          >
            <CirclePlay className="w-4 h-4" /> Bepul dars
          </Link>
          <Link
            href="/meetlar"
            prefetch={true}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-ink)]"
          >
            Meetlar
          </Link>
          <Link
            href="/blog"
            prefetch={true}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-ink)]"
          >
            Blog & Maqolalar
          </Link>
          <Link
            href="/testimoniyalar"
            prefetch={true}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-ink)]"
          >
            Bitiruvchilar Natijalari
          </Link>
          <Link
            href="/ish"
            prefetch={true}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-ink)]"
          >
            Bo'sh ish o'rinlari
          </Link>
          <Link
            href="/resurslar"
            prefetch={true}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-ink)]"
          >
            Resurslar
          </Link>
          <a
            href={ctaLink}
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-center py-3 rounded-[var(--radius-md)] btn-primary text-sm font-semibold"
          >
            {ctaText}
          </a>
        </div>
      )}
    </header>
    </>
  );
});
