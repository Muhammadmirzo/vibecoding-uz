"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, BriefcaseBusiness, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";
import { PORTFOLIO_OWNERSHIPS, PORTFOLIO_STATUSES, portfolioOwnershipSchema, portfolioStatusSchema, type PortfolioUpdateInput } from "@/lib/validations/portfolio";

const OWNERSHIP_LABELS = { owner: "Egasining", student: "Talabaning", client: "Mijozning", demo: "Demo" } as const;
const STATUS_LABELS = { published: "Ochiq", draft: "Qoralama", hidden: "Yashirilgan" } as const;
const controlClass = "min-h-11 rounded-lg border border-border bg-bg-elevated px-3 text-sm";

type Props = {
  items: PortfolioItem[];
  isLoading: boolean;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (item: PortfolioItem) => void;
  onToggleFeatured: (item: PortfolioItem) => void;
  onMove: (item: PortfolioItem, direction: -1 | 1) => void;
  onQuickField: (item: PortfolioItem, body: PortfolioUpdateInput, message: string) => void;
};

export function PortfolioTable(props: Props) {
  if (props.isLoading) return <div role="status" className="grid min-h-64 place-items-center rounded-2xl border border-border bg-bg-elevated"><div className="text-center"><Loader2 className="mx-auto size-7 animate-spin text-brand" /><p className="mt-3 text-sm text-ink-muted">Loyihalar yuklanmoqda...</p></div></div>;
  if (props.items.length === 0) return <div className="rounded-2xl border border-dashed border-border bg-bg-elevated px-6 py-14 text-center"><BriefcaseBusiness className="mx-auto size-8 text-ink-subtle" /><h2 className="mt-3 font-semibold text-ink">Loyihalar topilmadi</h2><p className="mt-1 text-sm text-ink-muted">Filtrni o&apos;zgartiring yoki yangi loyiha qo&apos;shing.</p></div>;
  return <div className="space-y-3">{props.items.map((item, index) => <PortfolioRow key={item.id} item={item} first={index === 0} last={index === props.items.length - 1} {...props} />)}</div>;
}

function PortfolioRow({ item, first, last, onEdit, onDelete, onToggleFeatured, onMove, onQuickField }: Props & { item: PortfolioItem; first: boolean; last: boolean }) {
  const saveRank = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rank = Number(data.get("rank"));
    if (rank >= 1 && rank <= 3 && rank !== item.featuredRank) onQuickField(item, { featuredRank: rank, isFeatured: true }, "Asosiy o'rin yangilandi");
  };
  return <article className="rounded-2xl border border-border bg-bg-elevated p-4 shadow-sm sm:p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 gap-3">
        {item.coverUrl ? <Image src={item.coverUrl} alt="" width={80} height={80} sizes="80px" unoptimized className="size-16 shrink-0 rounded-xl object-cover" /> : <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-bg-sunken text-ink-subtle"><BriefcaseBusiness className="size-5" /></span>}
        <div className="min-w-0"><h2 className="truncate font-semibold text-ink">{item.title}</h2><p className="mt-1 line-clamp-2 text-sm text-ink-muted">{item.description}</p><a href={item.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-brand">{item.domain}<ExternalLink className="size-3" /></a></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-end">
        <label className="text-xs font-semibold text-ink-muted">Egaligi<select className={`${controlClass} mt-1 block w-full`} value={item.ownership} onChange={(e) => onQuickField(item, { ownership: portfolioOwnershipSchema.parse(e.currentTarget.value) }, "Egalik yangilandi")}>{PORTFOLIO_OWNERSHIPS.map((value) => <option key={value} value={value}>{OWNERSHIP_LABELS[value]}</option>)}</select></label>
        <label className="text-xs font-semibold text-ink-muted">Holati<select className={`${controlClass} mt-1 block w-full`} value={item.status} onChange={(e) => onQuickField(item, { status: portfolioStatusSchema.parse(e.currentTarget.value) }, "Holat yangilandi")}>{PORTFOLIO_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}</select></label>
        <form onSubmit={saveRank} className="text-xs font-semibold text-ink-muted">Asosiy o&apos;rin<input name="rank" type="number" min={1} max={3} defaultValue={item.featuredRank || ""} aria-label={`${item.title} asosiy o'rni`} className={`${controlClass} mt-1 block w-24`} /></form>
        <div className="flex gap-1"><button type="button" disabled={first} onClick={() => onMove(item, -1)} className="grid size-11 place-items-center rounded-lg border border-border disabled:opacity-30" aria-label={`${item.title}ni yuqoriga ko'chirish`}><ArrowUp className="size-4" /></button><button type="button" disabled={last} onClick={() => onMove(item, 1)} className="grid size-11 place-items-center rounded-lg border border-border disabled:opacity-30" aria-label={`${item.title}ni pastga ko'chirish`}><ArrowDown className="size-4" /></button></div>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <button type="button" onClick={() => onToggleFeatured(item)} className="min-h-11 rounded-lg bg-bg-sunken px-3 text-sm font-semibold text-ink">{item.isFeatured ? "Asosiy ✓" : "Asosiy qilish"}</button>
      <span className="text-xs text-ink-subtle">Tartib: {item.sortOrder}</span>
      <button type="button" onClick={() => onEdit(item)} className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-ink"><Pencil className="size-4" />Tahrirlash</button>
      <button type="button" onClick={() => onDelete(item)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-danger"><Trash2 className="size-4" />O&apos;chirish</button>
    </div>
  </article>;
}
