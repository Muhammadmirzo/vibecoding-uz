"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <button className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-bg-sunken text-ink-muted opacity-50" aria-label="Rejimni o'zgartirish"><Sun className="size-4" /></button>;
  const isDark = theme === "dark";
  return (
    <button onClick={() => setTheme(isDark ? "light" : "dark")} className="inline-flex size-11 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-bg-sunken hover:text-accent" title={isDark ? "Yorug' rejimga o'tish (Light)" : "To'q rejimga o'tish (Dark)"} aria-label="Rejimni o'zgartirish">
      {isDark ? <Moon className="size-5 text-accent" /> : <Sun className="size-5 text-ink" />}
    </button>
  );
}
