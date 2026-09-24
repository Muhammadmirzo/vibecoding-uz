"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { Camera, Loader2, Sparkles, X } from "lucide-react";
import { PORTFOLIO_CATEGORIES } from "@/lib/validations/portfolio";
import { fetchOgImage } from "@/features/portfolio/portfolioUtils";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";
import type { PortfolioFormData } from "./types";

type Props = { open: boolean; editingItem: PortfolioItem | null; formData: PortfolioFormData; formErrors: Record<string, string>; isSubmitting: boolean; onOpenChange: (open: boolean) => void; onChange: (data: PortfolioFormData) => void; onSubmit: (e: React.FormEvent) => void; onToast: (message: string) => void; };
export function PortfolioFormModal({ open, editingItem, formData, formErrors, isSubmitting, onOpenChange, onChange, onSubmit, onToast }: Props) {
  const update = (patch: Partial<PortfolioFormData>) => onChange({ ...formData, ...patch });
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}> <Dialog.Portal> <Dialog.Overlay className="fixed inset-0 bg-ink/50 backdrop-blur-xs z-50 animate-fade-in" /> <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-bg-elevated p-6 rounded-2xl border border-border shadow-2xl z-50 space-y-5"> <div className="flex items-center justify-between border-b border-border pb-4"> <Dialog.Title className="text-xl font-bold text-ink flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /><span>{editingItem ? "Portfolioni Tahrirlash" : "Yangi Portfolio Qo'shish"}</span></Dialog.Title> <Dialog.Close className="p-1 rounded-lg hover:bg-bg-sunken text-ink-muted hover:text-ink"><X className="w-5 h-5" /></Dialog.Close> </div> <form onSubmit={onSubmit} className="space-y-4 text-xs sm:text-sm"> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> <div> <label className="block font-semibold text-ink mb-1">Nomi (Title) *</label> <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      const autoSlug = val
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                      update({
                        ...formData,
                        title: val,
                        slug: autoSlug || formData.slug,
                      });
                    }}
                    placeholder="EduBaza"
                    className="w-full px-3.5 py-2 bg-bg-sunken border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-danger mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div> <label className="block font-semibold text-ink mb-1">Slug *</label> <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => update({ ...formData, slug: e.target.value })}
                    placeholder="edubaza"
                    className="w-full px-3.5 py-2 bg-bg-sunken border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {formErrors.slug && (
                    <p className="text-xs text-danger mt-1">{formErrors.slug}</p>
                  )}
                </div> </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> <div> <label className="block font-semibold text-ink mb-1">Sayt Havolasi (URL) *</label> <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => {
                      const val = e.target.value;
                      let dom = "";
                      try {
                        const targetUrl = val.startsWith("http") ? val : `https://${val}`;
                        dom = new URL(targetUrl).hostname;
                      } catch (err) {}
                      update({
                        ...formData,
                        url: val,
                        domain: dom || formData.domain,
                      });
                    }}
                    placeholder="https://edubaza.uz"
                    className="w-full px-3.5 py-2 bg-bg-sunken border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {formErrors.url && (
                    <p className="text-xs text-danger mt-1">{formErrors.url}</p>
                  )}
                </div>

                <div> <label className="block font-semibold text-ink mb-1">Domen Nomi *</label> <input
                    type="text"
                    required
                    value={formData.domain}
                    onChange={(e) => update({ ...formData, domain: e.target.value })}
                    placeholder="edubaza.uz"
                    className="w-full px-3.5 py-2 bg-bg-sunken border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {formErrors.domain && (
                    <p className="text-xs text-danger mt-1">{formErrors.domain}</p>
                  )}
                </div> </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> <div> <label className="block font-semibold text-ink mb-1">Kategoriya *</label> <select
                    value={formData.category}
                    onChange={(e) =>
                      update({
                        ...formData,
                        category: e.target.value as "Startup MVP" | "EdTech" | "AI Bot" | "B2B SaaS",
                      })
                    }
                    className="w-full px-3.5 py-2 bg-bg-sunken border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {PORTFOLIO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select> </div>

                <div> <label className="block font-semibold text-ink mb-1">Foydalanuvchilar Soni Metrikasi</label> <input
                    type="text"
                    value={formData.userCount}
                    onChange={(e) => update({ ...formData, userCount: e.target.value })}
                    placeholder="27 000+ o'qituvchi foydalanadi"
                    className="w-full px-3.5 py-2 bg-bg-sunken border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  /> </div> </div>

              <div> <label className="block font-semibold text-ink mb-1">Tavsif (Description) *</label> <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => update({ ...formData, description: e.target.value })}
                  placeholder="O'qituvchilar uchun interaktiv ta'lim resurslari platformasi"
                  className="w-full px-3.5 py-2 bg-bg-sunken border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
                {formErrors.description && (
                  <p className="text-xs text-danger mt-1">{formErrors.description}</p>
                )}
              </div>

              <div> <div className="flex items-center justify-between mb-1"> <label className="block font-semibold text-ink">Rasm Havolasi (Image URL)</label> <button
                    type="button"
                    onClick={async () => {
                      if (formData.url && formData.url !== "https://") {
                        const og = await fetchOgImage(formData.url);
                        if (og) {
                          update({ imageUrl: og });
                          onToast("Saytdan rasm topildi!");
                        } else {
                          onToast("Saytdan rasm topilmadi (standart ko'rinish ishlatiladi)");
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
                  > <Camera className="w-3.5 h-3.5" /> <span>Saytdan rasm olish (OG)</span> </button> </div> <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => update({ ...formData, imageUrl: e.target.value })}
                  placeholder="Bo'sh qoldirilsa, avtomatik standart dizayn ko'rsatiladi"
                  className="w-full px-3.5 py-2 bg-bg-sunken border border-border rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {formData.imageUrl && (
                  <div className="mt-2.5 rounded-lg border border-border overflow-hidden bg-bg-sunken aspect-[16/10] max-h-40"> <Image
                      src={formData.imageUrl}
                      alt="Yuklanayotgan portfolio rasmi"
                      width={640}
                      height={400}
                      sizes="(max-width: 640px) 100vw, 576px"
                      className="h-full w-full object-cover object-top"
                      loader={({ src }) => src}
                      unoptimized
                      onError={() => {
                        update({ imageUrl: "" });
                      }}
                    /> </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2"> <label className="flex items-center gap-2 cursor-pointer font-semibold text-ink"> <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => update({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-accent focus:ring-accent"
                  /> <span>Bosh sahifada ko&apos;rsatish (Top 6)</span> </label>

                <div className="flex items-center gap-2"> <span className="text-xs font-mono text-ink-muted">Tartib:</span> <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => update({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-16 px-2 py-1 bg-bg-sunken border border-border rounded-lg font-mono text-center"
                  /> </div> </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border"> <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 rounded-xl bg-bg-sunken text-ink hover:bg-bg-sunken font-semibold"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-accent text-ink font-semibold shadow-sm hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? "Saqlanmoqda..." : editingItem ? "Yangilash" : "Qo'shish"}</span> </button> </div> </form> </Dialog.Content> </Dialog.Portal> </Dialog.Root>
  );
}
