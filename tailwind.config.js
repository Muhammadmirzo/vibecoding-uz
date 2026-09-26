function alpha(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined && !opacityValue.includes("var(")) {
      return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${variableName})`;
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/features/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: alpha("--bg"), elevated: alpha("--bg-elevated"), sunken: alpha("--bg-sunken") },
        ink: { DEFAULT: alpha("--ink"), muted: alpha("--ink-muted"), subtle: alpha("--ink-subtle") },
        brand: { DEFAULT: alpha("--brand"), hover: alpha("--brand-hover"), soft: alpha("--brand-soft"), surface: "var(--brand-surface)" },
        accent: { DEFAULT: alpha("--accent"), hover: alpha("--accent-hover"), soft: alpha("--accent-soft") },
        gold: { DEFAULT: alpha("--gold"), hover: alpha("--gold-hover"), soft: alpha("--gold-soft") },
        border: { DEFAULT: alpha("--border"), strong: alpha("--border-strong"), onBrand: "var(--border-on-brand-surface)" },
        success: { DEFAULT: alpha("--success"), soft: alpha("--success-soft"), line: alpha("--success-line") },
        danger: { DEFAULT: alpha("--danger"), soft: alpha("--danger-soft") },
        telegram: { DEFAULT: alpha("--telegram"), hover: alpha("--telegram-hover"), soft: alpha("--telegram-soft"), solid: "var(--telegram-solid)" },
        "on-gold": "var(--on-gold)",
        "on-brand-surface": "var(--on-brand-surface)",
        "on-telegram": "var(--on-telegram)",
        terminal: { DEFAULT: alpha("--terminal-bg"), ink: alpha("--terminal-ink"), muted: alpha("--terminal-muted"), border: alpha("--terminal-border") },
      },
      fontFamily: { display: ["var(--font-display)", "var(--font-sans)", "sans-serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"], mono: ["var(--font-mono)", "monospace"] },
      borderRadius: { sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", xl: "var(--radius-xl)" },
      boxShadow: { sm: "var(--shadow-sm)", md: "var(--shadow-md)", lg: "var(--shadow-lg)" },
      transitionDuration: { instant: "var(--motion-instant)", fast: "var(--motion-fast)", base: "var(--motion-base)", slow: "var(--motion-slow)", epic: "var(--motion-epic)" },
      transitionTimingFunction: { "out-expo": "var(--motion-ease-out)", "out-quint": "var(--motion-ease-quint)", spring: "var(--motion-ease-spring)" },
      maxWidth: { container: "1200px" },
      keyframes: { "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } }, "typing-caret": { "0%, 45%": { opacity: "1" }, "50%, 100%": { opacity: "0" } }, marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } } },
      animation: { "fade-up": "fade-up 500ms cubic-bezier(.16,1,.3,1) both", "typing-caret": "typing-caret 1s steps(2, jump-none) infinite", marquee: "marquee 28s linear infinite" },
    },
  },
  plugins: [],
};
