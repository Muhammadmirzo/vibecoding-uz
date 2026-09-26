"use client";

export function StickyBuyBar({ price, title, courseSlug }: { price: string; title: string; courseSlug: string }) {
  return (
    <div data-sticky-buy-bar className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[color-mix(in_srgb,var(--bg-elevated)_95%,transparent)] px-4 pt-3 backdrop-blur lg:hidden [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-container items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-ink">{title}</p>
          <p className="font-display text-base font-semibold text-brand">{price}</p>
        </div>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("open-course-checkout", { detail: { courseSlug } }),
            )
          }
          className="btn-press inline-flex min-h-11 shrink-0 items-center rounded-full bg-gold px-4 text-sm font-semibold text-on-gold shadow-sm"
        >
          Band qilish
        </button>
      </div>
    </div>
  );
}
