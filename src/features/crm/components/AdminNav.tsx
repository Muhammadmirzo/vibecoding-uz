"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Kanban,
  Users,
  GraduationCap,
  CheckSquare,
  BarChart3,
  ArrowLeft,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Send,
  Settings,
} from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Boshqaruv",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/leads",
      label: "Leads Kanban",
      icon: Kanban,
      exact: false,
    },
    {
      href: "/admin/cohorts",
      label: "Guruhlar",
      icon: GraduationCap,
      exact: false,
    },
    {
      href: "/admin/homework",
      label: "Uy Vazifalari",
      icon: CheckSquare,
      exact: false,
    },
    {
      href: "/admin/blog",
      label: "Blog CMS",
      icon: FileText,
      exact: false,
    },
    {
      href: "/admin/notifications",
      label: "Xabarnomalar",
      icon: Send,
      exact: false,
    },
    {
      href: "/admin/users",
      label: "Foydalanuvchilar",
      icon: Users,
      exact: false,
    },
    {
      href: "/admin/settings",
      label: "Sozlamalar",
      icon: Settings,
      exact: false,
    },
    {
      href: "/admin/analytics",
      label: "Analitika",
      icon: BarChart3,
      exact: false,
    },
  ];

  return (
    <header className="bg-cream-warm border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Badge */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center text-xs text-ink-muted hover:text-ink transition-colors"
              title="Platformaga qaytish"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Saytga qaytish</span>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-ink">
                Vibecoding <span className="accent-serif font-normal">CRM</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-soft text-accent border border-accent-line">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Admin
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-accent text-white shadow-sm"
                      : "text-ink-muted hover:text-ink hover:bg-cream-deep"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex space-x-1 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-accent text-white shadow-sm"
                    : "text-ink-muted hover:text-ink bg-cream"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
