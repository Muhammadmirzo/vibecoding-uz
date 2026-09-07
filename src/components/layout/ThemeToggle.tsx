"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-[var(--radius-md)] border border-transparent bg-[var(--color-cream-warm)] flex items-center justify-center opacity-50" aria-label="Toggle theme">
        <Sun className="w-4 h-4 text-[var(--color-ink-muted)]" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-cream-warm)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      title={isDark ? "Yorug' rejimga o'tish" : "To'q rejimga o'tish"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-[var(--color-accent)] transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--color-ink)] transition-transform duration-300 rotate-0 scale-100" />
      )}
    </button>
  );
}
