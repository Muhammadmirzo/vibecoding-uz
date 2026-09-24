/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/features/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "var(--bg)", elevated: "var(--bg-elevated)", sunken: "var(--bg-sunken)" },
        ink: { DEFAULT: "var(--ink)", muted: "var(--ink-muted)", subtle: "var(--ink-subtle)" },
        brand: { DEFAULT: "var(--brand)", hover: "var(--brand-hover)", soft: "var(--brand-soft)" },
        accent: { DEFAULT: "var(--accent)", hover: "var(--accent-hover)", soft: "var(--accent-soft)" },
        gold: { DEFAULT: "var(--gold)", hover: "var(--gold-hover)", soft: "var(--gold-soft)" },
        border: { DEFAULT: "var(--border)", strong: "var(--border-strong)" },
        success: { DEFAULT: "var(--success)", soft: "var(--success-soft)", line: "var(--success-line)" },
        danger: { DEFAULT: "var(--danger)", soft: "var(--danger-soft)" },
        telegram: { DEFAULT: "var(--telegram)", hover: "var(--telegram-hover)", soft: "var(--telegram-soft)" },
      },
      fontFamily: { display: ["var(--font-display)", "var(--font-sans)", "sans-serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"], mono: ["var(--font-mono)", "monospace"] },
      borderRadius: { sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", xl: "var(--radius-xl)" },
      boxShadow: { sm: "var(--shadow-sm)", md: "var(--shadow-md)", lg: "var(--shadow-lg)" },
      maxWidth: { container: "1200px" },
      keyframes: { "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } }, "typing-caret": { "0%, 45%": { opacity: "1" }, "50%, 100%": { opacity: "0" } }, marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } } },
      animation: { "fade-up": "fade-up 500ms cubic-bezier(.16,1,.3,1) both", "typing-caret": "typing-caret 1s steps(2, jump-none) infinite", marquee: "marquee 28s linear infinite" },
    },
  },
  plugins: [],
};
