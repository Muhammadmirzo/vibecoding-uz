"use client";

export function StickyBuyBar({ price, title }: { price: string; title: string }) {
  return (
    <div data-sticky-buy-bar className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-elevated/95 px-4 pt-3 backdrop-blur lg:hidden [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-container items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-ink">{title}</p>
          <p className="font-display text-base font-semibold text-brand">{price}</p>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-course-checkout"))}
          className="btn-press inline-flex min-h-11 shrink-0 items-center rounded-lg bg-gold px-4 text-sm font-semibold text-ink shadow-sm"
        >
          Band qilish
        </button>
      </div>
    </div>
  );
}
