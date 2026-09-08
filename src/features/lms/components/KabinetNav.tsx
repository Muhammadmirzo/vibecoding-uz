"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  CreditCard,
  Share2,
  Settings,
} from "lucide-react";

export function KabinetNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/kabinet",
      label: "Bosh sahifa",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/kabinet/kurs/vibe-coding-express",
      label: "Darslar & Modullar",
      icon: BookOpen,
      exact: false,
    },
    {
      href: "/kabinet/baholar",
      label: "Baholar & Reyting",
      icon: Award,
      exact: true,
    },
    {
      href: "/kabinet/to-lovlar",
      label: "To'lovlar & Cheklar",
      icon: CreditCard,
      exact: true,
    },
    {
      href: "/kabinet/sertifikat",
      label: "Sertifikat",
      icon: Award,
      exact: true,
    },
    {
      href: "/kabinet/referral",
      label: "Referral & Bonus",
      icon: Share2,
      exact: true,
    },
    {
      href: "/kabinet/sozlamalar",
      label: "Sozlamalar",
      icon: Settings,
      exact: true,
    },
  ];

  return (
    <div className="w-full bg-cream-warm border-b border-border mb-8 sticky top-16 z-30 shadow-sm backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        <div className="flex items-center justify-between py-2 overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-1.5 md:gap-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-accent text-white shadow-sm"
                      : "text-ink-muted hover:text-ink hover:bg-cream-deep"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

        </div>
      </div>
    </div>
  );
}
