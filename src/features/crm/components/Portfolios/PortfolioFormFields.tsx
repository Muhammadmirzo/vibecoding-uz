"use client";

import Image from "next/image";
import { Camera, ExternalLink } from "lucide-react";
import { fetchOgImage } from "@/features/portfolio/portfolioUtils";
import { PORTFOLIO_CATEGORIES, PORTFOLIO_OWNERSHIPS, PORTFOLIO_STATUSES, portfolioCategorySchema, portfolioOwnershipSchema, portfolioStatusSchema } from "@/lib/validations/portfolio";
import type { PortfolioFormData } from "./types";

const OWNERSHIP_LABELS = { owner: "Egasining", student: "Talabaning", client: "Mijozning", demo: "Demo" } as const;
const STATUS_LABELS = { published: "Ochiq", draft: "Qoralama", hidden: "Yashirilgan" } as const;
const fieldClass = "mt-1 min-h-11 w-full rounded-lg border border-border bg-bg-sunken px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent";

type Props = {
  data: PortfolioFormData;
  errors: Record<string, string>;
  onChange: (data: PortfolioFormData) => void;
  onToast: (message: string) => void;
};

export function PortfolioFormFields({ data, errors, onChange, onToast }: Props) {
  const update = (patch: Partial<PortfolioFormData>) => onChange({ ...data, ...patch });
  return <div className="space-y-4 text-sm">
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Loyiha nomi *" error={errors.title}><input className={fieldClass} value={data.title} onChange={(e) => update({ title: e.currentTarget.value, slug: e.currentTarget.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || data.slug })} /></Field>
      <Field label="Slug *" error={errors.slug}><input className={`${fieldClass} font-mono`} value={data.slug} onChange={(e) => update({ slug: e.currentTarget.value })} /></Field>
    </div>
    <Field label="Jonli havola *" error={errors.url}><div className="flex gap-2"><input type="url" className={fieldClass} value={data.url} onChange={(e) => update({ url: e.currentTarget.value })} /><a href={data.url} target="_blank" rel="noreferrer" aria-label="Jonli havolani tekshirish" className="grid min-h-11 w-11 shrink-0 place-items-center rounded-lg border border-border"><ExternalLink className="size-4" /></a></div><p className="mt-1 text-xs text-ink-muted">URL to'g'ri bo'lishi saqlashda tekshiriladi.</p></Field>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Domen *" error={errors.domain}><input className={fieldClass} value={data.domain} onChange={(e) => update({ domain: e.currentTarget.value })} /></Field>
      <Field label="Kategoriya *"><select className={fieldClass} value={data.category} onChange={(e) => update({ category: portfolioCategorySchema.parse(e.currentTarget.value) })}>{PORTFOLIO_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></Field>
    </div>
    <Field label="Tavsif *" error={errors.description}><textarea rows={3} className={`${fieldClass} resize-y`} value={data.description} onChange={(e) => update({ description: e.currentTarget.value })} /></Field>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Egaligi *"><select className={fieldClass} value={data.ownership} onChange={(e) => update({ ownership: portfolioOwnershipSchema.parse(e.currentTarget.value) })}>{PORTFOLIO_OWNERSHIPS.map((item) => <option key={item} value={item}>{OWNERSHIP_LABELS[item]}</option>)}</select></Field>
      <Field label="Holati *"><select className={fieldClass} value={data.status} onChange={(e) => update({ status: portfolioStatusSchema.parse(e.currentTarget.value) })}>{PORTFOLIO_STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABELS[item]}</option>)}</select></Field>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Muqova rasm URL"><input className={fieldClass} value={data.coverUrl} onChange={(e) => update({ coverUrl: e.currentTarget.value, imageUrl: e.currentTarget.value })} /></Field>
      <Field label="Manba kodi URL"><input className={fieldClass} value={data.repoUrl} onChange={(e) => update({ repoUrl: e.currentTarget.value })} /></Field>
      <Field label="Jonli URL"><input type="url" className={fieldClass} value={data.liveUrl} onChange={(e) => update({ liveUrl: e.currentTarget.value })} /></Field>
      <Field label="Foydalanuvchi ko'rsatkichi"><input className={fieldClass} value={data.userCount} onChange={(e) => update({ userCount: e.currentTarget.value })} /></Field>
    </div>
    {data.coverUrl ? <Image src={data.coverUrl} alt="Muqova rasm namunasi" width={640} height={360} sizes="576px" unoptimized className="aspect-video w-full rounded-xl border border-border object-cover" /> : <button type="button" onClick={async () => { const url = await fetchOgImage(data.url); if (url) update({ coverUrl: url, imageUrl: url }); onToast(url ? "Saytdan rasm topildi" : "Rasm topilmadi"); }} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand"><Camera className="size-4" />Saytdan rasm olish</button>}
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Texnologiyalar"><input className={fieldClass} value={data.techStack} onChange={(e) => update({ techStack: e.currentTarget.value })} placeholder="Next.js, TypeScript" /><p className="mt-1 text-xs text-ink-muted"> Vergul bilan ajrating.</p></Field>
      <Field label="Badge matni"><input className={fieldClass} value={data.badgeText} onChange={(e) => update({ badgeText: e.currentTarget.value })} /></Field>
    </div>
    <Field label="Qisqa isbot nuqtalari"><textarea rows={3} className={`${fieldClass} resize-y`} value={data.highlights} onChange={(e) => update({ highlights: e.currentTarget.value })} placeholder="Har bir qatorga bitta qisqa natija" /></Field>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3"><input type="checkbox" className="size-4" checked={data.isFeatured} onChange={(e) => update({ isFeatured: e.currentTarget.checked, featuredRank: e.currentTarget.checked ? data.featuredRank || 1 : null })} /><span>Bosh sahifada asosiy loyiha</span></label>
      <Field label="Asosiy o'rin (1–3)"><input type="number" min={1} max={3} className={fieldClass} value={data.featuredRank || ""} onChange={(e) => update({ featuredRank: e.currentTarget.value ? Number(e.currentTarget.value) : null })} /></Field>
      <Field label="Umumiy tartib"><input type="number" min={0} className={fieldClass} value={data.sortOrder} onChange={(e) => update({ sortOrder: Number(e.currentTarget.value) })} /></Field>
      <Field label="Ochiqlanish vaqti"><input type="datetime-local" className={fieldClass} value={data.publishedAt} onChange={(e) => update({ publishedAt: e.currentTarget.value })} /></Field>
    </div>
    {errors.featuredRank && <p className="text-danger">{errors.featuredRank}</p>}
  </div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block font-semibold text-ink"><span>{label}</span>{children}{error && <span className="mt-1 block text-xs text-danger">{error}</span>}</label>;
}
