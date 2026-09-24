"use client";

import Image from "next/image";
import { BriefcaseBusiness, ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";

type Props = { items: PortfolioItem[]; isLoading: boolean; onEdit: (item: PortfolioItem) => void; onDelete: (id: string, title: string) => void; onToggleFeatured: (item: PortfolioItem) => void };

function ProjectImage({ item }: { item: PortfolioItem }) {
  return item.imageUrl ? <Image src={item.imageUrl} alt="" width={80} height={80} sizes="80px" className="h-14 w-14 rounded-xl object-cover" loader={({ src }) => src} unoptimized /> : <span className="grid h-14 w-14 place-items-center rounded-xl bg-bg-sunken text-ink-subtle"><BriefcaseBusiness className="h-5 w-5" /></span>;
}

export function PortfolioTable({ items, isLoading, onEdit, onDelete, onToggleFeatured }: Props) {
  if (isLoading) return <div role="status" className="grid min-h-64 place-items-center rounded-2xl border border-border bg-bg-elevated"><div className="text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-brand" /><p className="mt-3 text-sm text-ink-muted">Portfoliolar yuklanmoqda...</p></div></div>;
  if (items.length === 0) return <div className="rounded-2xl border border-dashed border-border bg-bg-elevated px-6 py-14 text-center"><BriefcaseBusiness className="mx-auto h-8 w-8 text-ink-subtle" /><h3 className="mt-3 font-semibold text-ink">Loyihalar topilmadi</h3><p className="mt-1 text-sm text-ink-muted">Filtrni o&apos;zgartiring yoki yangi loyiha qo&apos;shing.</p></div>;
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated shadow-sm">
      <div className="space-y-3 p-3 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-border p-4">
            <div className="flex gap-3"><ProjectImage item={item} /><div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-ink">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-ink-muted">{item.description}</p></div></div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-ink-subtle">Kategoriya</dt><dd className="mt-1 text-ink">{item.category}</dd></div><div><dt className="text-xs text-ink-subtle">Foydalanuvchilar</dt><dd className="mt-1 text-ink">{item.userCount || "Ko&apos;rsatilmadi"}</dd></div></dl>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3"><a href={item.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand hover:underline">{item.domain}<ExternalLink className="h-4 w-4" /></a><button type="button" onClick={() => onToggleFeatured(item)} className={`ml-auto min-h-11 rounded-lg px-3 text-sm font-medium ${item.isFeatured ? "bg-success-soft text-success" : "bg-bg-sunken text-ink-muted"}`}>{item.isFeatured ? "Bosh sahifada" : "Oddiy"}</button><button type="button" onClick={() => onEdit(item)} className="grid h-11 w-11 place-items-center rounded-lg border border-border" aria-label={`${item.title}ni tahrirlash`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(item.id, item.title)} className="grid h-11 w-11 place-items-center rounded-lg border border-border text-danger" aria-label={`${item.title}ni o&apos;chirish`}><Trash2 className="h-4 w-4" /></button></div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-bg-sunken text-xs uppercase text-ink-muted"><tr><th className="px-4 py-3.5">Loyiha</th><th className="px-4 py-3.5">Domen</th><th className="px-4 py-3.5">Kategoriya</th><th className="px-4 py-3.5">Foydalanuvchilar</th><th className="px-4 py-3.5">Bosh sahifa</th><th className="px-4 py-3.5 text-right">Amallar</th></tr></thead>
          <tbody className="divide-y divide-border">{items.map((item) => <tr key={item.id} className="hover:bg-bg-sunken"><td className="px-4 py-4"><div className="flex items-center gap-3"><ProjectImage item={item} /><div className="min-w-0"><div className="font-semibold text-ink">{item.title}</div><div className="mt-0.5 line-clamp-1 max-w-xs text-xs text-ink-muted">{item.description}</div></div></div></td><td className="px-4 py-4"><a href={item.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 font-mono text-xs text-brand hover:underline">{item.domain}<ExternalLink className="h-3.5 w-3.5" /></a></td><td className="px-4 py-4"><span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">{item.category}</span></td><td className="px-4 py-4 text-xs text-ink-muted">{item.userCount || "Ko&apos;rsatilmadi"}</td><td className="px-4 py-4"><button type="button" onClick={() => onToggleFeatured(item)} className={`min-h-11 rounded-lg px-3 text-xs font-semibold ${item.isFeatured ? "bg-success-soft text-success" : "bg-bg-sunken text-ink-muted"}`}>{item.isFeatured ? "Faol" : "Oddiy"}</button></td><td className="px-4 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => onEdit(item)} className="grid h-11 w-11 place-items-center rounded-lg text-ink-muted hover:bg-bg-sunken hover:text-ink" aria-label={`${item.title}ni tahrirlash`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(item.id, item.title)} className="grid h-11 w-11 place-items-center rounded-lg text-ink-muted hover:bg-danger-soft hover:text-danger" aria-label={`${item.title}ni o&apos;chirish`}><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
