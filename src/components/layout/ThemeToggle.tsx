"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-md border border-transparent bg-cream-warm flex items-center justify-center opacity-50" aria-label="Toggle theme">
        <Sun className="w-4 h-4 text-ink-muted" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("likely");
    } else {
      setTheme("light");
    }
  };

  const getThemeTitle = () => {
    if (theme === "light") return "To'q rejimga o'tish (Dark)";
    if (theme === "dark") return "Likely rejimiga o'tish (Warm)";
    return "Yorug' rejimga o'tish (Light)";
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-md text-ink-muted hover:text-accent hover:bg-cream-warm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      title={getThemeTitle()}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5 text-accent" />
      ) : theme === "likely" ? (
        <Sparkles className="w-5 h-5 text-accent" />
      ) : (
        <Sun className="w-5 h-5 text-ink" />
      )}
    </button>
  );
}
