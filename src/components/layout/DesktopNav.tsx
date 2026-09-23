"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowRight, BookOpen, ChevronDown, CirclePlay } from "lucide-react";
import { courseLinks, resourceLinks, type NavItem } from "./headerData";

interface NavDropdownProps {
  label: string;
  items: NavItem[];
  icon?: typeof BookOpen;
  showCourseExtras?: boolean;
}

function NavDropdown({ label, items, icon: Icon, showCourseExtras }: NavDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border/80 bg-cream-warm/60 px-3 text-sm font-semibold text-ink transition-colors hover:bg-cream-deep">
          {Icon ? <Icon className="h-4 w-4 text-accent" aria-hidden="true" /> : null}
          <span>{label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-subtle" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={6} className="z-50 w-80 space-y-1.5 rounded-2xl border border-border bg-cream p-3 shadow-2xl">
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <DropdownMenu.Item key={item.href} asChild>
                <Link href={item.href} prefetch className="group/item flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-cream-warm focus:outline-none">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-cream-warm text-accent shadow-xs">
                    <ItemIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink group-hover/item:text-accent">{item.title}</span>
                    {item.description ? <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{item.description}</span> : null}
                  </span>
                </Link>
              </DropdownMenu.Item>
            );
          })}
          {showCourseExtras ? (
            <>
              <DropdownMenu.Separator className="my-1.5 h-px bg-border" />
              <DropdownMenu.Item asChild>
                <Link href="/testimoniyalar" className="flex items-center justify-between rounded-xl p-2.5 hover:bg-cream-warm focus:outline-none">
                  <span><span className="block text-xs font-bold text-ink">Bitiruvchilar fikrlari</span><span className="block text-[11px] text-ink-muted">Real talabalar otzivlari</span></span>
                  <ArrowRight className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href="/#kurs-tanlash" className="flex items-center justify-between rounded-xl bg-cream-warm/50 p-2.5 hover:bg-cream-warm focus:outline-none">
                  <span className="text-xs font-bold text-accent">Barcha kurslar</span>
                  <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
                </Link>
              </DropdownMenu.Item>
            </>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function DesktopNav() {
  return (
    <nav className="hidden shrink-0 items-center gap-1.5 lg:flex" aria-label="Asosiy navigatsiya">
      <NavDropdown label="Kurslar" items={courseLinks} icon={BookOpen} showCourseExtras />
      <Link href="/bepul-dars" prefetch className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft">
        <CirclePlay className="h-4 w-4" aria-hidden="true" /> Bepul dars
      </Link>
      <Link href="/xizmatlar" prefetch className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-ink transition-colors hover:bg-cream-warm">Xizmatlar</Link>
      <Link href="/meetlar" prefetch className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-ink transition-colors hover:bg-cream-warm">Meetlar</Link>
      <NavDropdown label="Resurslar" items={resourceLinks} />
      <Link href="/testimoniyalar" prefetch className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-ink transition-colors hover:bg-cream-warm">Ekspertlar</Link>
    </nav>
  );
}
