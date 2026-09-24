"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const MobileDrawer = dynamic(
  () => import("./MobileDrawer").then((mod) => mod.MobileDrawer),
  { ssr: false },
);

export function HeaderControls() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <ThemeToggle />
      <UserMenu />
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-lg text-ink hover:bg-bg-sunken lg:hidden"
        aria-label="Navigatsiyani ochish"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      {menuOpen ? <MobileDrawer open onOpenChange={setMenuOpen} /> : null}
    </>
  );
}
