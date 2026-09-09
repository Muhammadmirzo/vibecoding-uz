"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Globe,
  Loader2,
  Camera,
} from "lucide-react";
import { PORTFOLIO_DATA, type PortfolioItem } from "@/features/portfolio/portfolioData";
import { portfolioSchema, PORTFOLIO_CATEGORIES } from "@/lib/validations/portfolio";
import {
  fetchOgImage,
  resolvePortfolioImageUrl,
} from "@/features/portfolio/portfolioUtils";

export function PortfolioManager() {
  const [items, setItems] = React.useState<PortfolioItem[]>(PORTFOLIO_DATA);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Barchasi");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PortfolioItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = React.useState({
    title: "",
    slug: "",
    url: "",
    domain: "",
    category: "Startup MVP" as "Startup MVP" | "EdTech" | "AI Bot" | "B2B SaaS",
    description: "",
    imageUrl: "/illustrations/founder/edubaza.webp",
    userCount: "",
    badgeText: "Shu metod bilan qurilgan",
    isFeatured: true,
    sortOrder: 1,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch portfolios from API on mount
  React.useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.portfolios) && data.portfolios.length > 0) {
          setItems(data.portfolios);
        }
      })
      .catch((err) => console.error("Error fetching portfolios:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      slug: "",
      url: "https://",
      domain: "",
      category: "Startup MVP",
      description: "",
      imageUrl: "",
      userCount: "",
      badgeText: "Shu metod bilan qurilgan",
      isFeatured: true,
      sortOrder: items.length + 1,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      url: item.url,
      domain: item.domain,
      category: item.category,
      description: item.description,
      imageUrl: resolvePortfolioImageUrl(item),
      userCount: item.userCount || "",
      badgeText: item.badgeText,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validated = portfolioSchema.safeParse(formData);
    if (!validated.success) {
      const fieldErrors: Record<string, string> = {};
      const flattened = validated.error.flatten().fieldErrors;
      (Object.keys(flattened) as Array<keyof typeof flattened>).forEach((key) => {
        const errArr = flattened[key];
        if (errArr && errArr[0]) {
          fieldErrors[key] = errArr[0];
        }
      });
      setFormErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingItem) {
        // API Call PATCH
        const res = await fetch(`/api/portfolio/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated.data),
        });
        const resData = await res.json();

        const updatedItem: PortfolioItem = resData.portfolio || {
          ...editingItem,
          ...validated.data,
        };

        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? updatedItem : i))
        );
        showToast("Portfolio loyihasi yangilandi!");
      } else {
        // API Call POST
        const res = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated.data),
        });
        const resData = await res.json();

        const newItem: PortfolioItem = resData.portfolio || {
          ...validated.data,
          id: `portfolio-${Date.now()}`,
        };

        setItems((prev) => [newItem, ...prev]);
        showToast("Yangi portfolio loyihasi qo'shildi!");
      }

      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Haqiqatan ham "${title}" portfoliosini o'chirmoqchimisiz?`)) return;

    try {
      await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Portfolio o'chirildi");
    } catch (err) {
      console.error(err);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Portfolio o'chirildi");
    }
  };

  const toggleFeatured = async (item: PortfolioItem) => {
    const nextFeatured = !item.isFeatured;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isFeatured: nextFeatured } : i))
    );

    try {
      await fetch(`/api/portfolio/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextFeatured }),
      });
      showToast("Status yangilandi!");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "Barchasi" || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, searchQuery, selectedCategory]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-warm border border-border p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink flex items-center gap-2">
            <Globe className="w-7 h-7 text-accent" />
            <span>Portfolio Boshqaruvi</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Vibe Coding platformasida yaratilgan jonli loyihalar va portfolio kartalarini qo&apos;shing va tahrirlang.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-sm hover:bg-accent-hover transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Portfolio Qo&apos;shish</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-cream border border-border p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Portfolio yoki domen bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-cream-warm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("Barchasi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              selectedCategory === "Barchasi"
                ? "bg-accent text-white"
                : "bg-cream-warm text-ink-muted hover:text-ink"
            }`}
          >
            Barchasi ({items.length})
          </button>
          {PORTFOLIO_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-accent text-white"
                  : "bg-cream-warm text-ink-muted hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Table / Data Grid */}
      <div className="bg-cream border border-border rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-ink-muted flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <span>Portfoliolar yuklanmoqda...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-cream-warm border-b border-border text-xs font-mono text-ink-muted uppercase">
                  <th className="py-3.5 px-4 font-semibold">Loyiha</th>
                  <th className="py-3.5 px-4 font-semibold">Domen / Havola</th>
                  <th className="py-3.5 px-4 font-semibold">Kategoriya</th>
                  <th className="py-3.5 px-4 font-semibold">Foydalanuvchilar</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Bosh Sahifa</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-warm/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-ink">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cream-deep overflow-hidden border border-border shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-ink">{item.title}</div>
                          <div className="text-xs text-ink-muted font-normal line-clamp-1 max-w-[200px]">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-xs text-accent">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <span>{item.domain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-soft text-accent">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-ink-muted">
                      {item.userCount || "Ko'rsatilmadi"}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleFeatured(item)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          item.isFeatured
                            ? "bg-success/15 text-success hover:bg-success/25"
                            : "bg-cream-deep text-ink-subtle hover:bg-cream-warm"
                        }`}
                      >
                        {item.isFeatured ? "Faol (Top 6)" : "Oddiy"}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-lg bg-cream-warm text-ink hover:text-accent hover:bg-cream-deep transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-2 rounded-lg bg-cream-warm text-error hover:bg-error-soft transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="py-12 text-center text-ink-muted text-sm">
            Hech qanday portfolio loyihasi topilmadi.
          </div>
        )}
      </div>

      {/* Add / Edit Portfolio Modal Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/50 backdrop-blur-xs z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-cream p-6 rounded-2xl border border-border shadow-2xl z-50 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Dialog.Title className="text-xl font-bold text-ink flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span>{editingItem ? "Portfolioni Tahrirlash" : "Yangi Portfolio Qo'shish"}</span>
              </Dialog.Title>
              <Dialog.Close className="p-1 rounded-lg hover:bg-cream-warm text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink mb-1">Nomi (Title) *</label>
                  <input
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
                      setFormData({
                        ...formData,
                        title: val,
                        slug: autoSlug || formData.slug,
                      });
                    }}
                    placeholder="EduBaza"
                    className="w-full px-3.5 py-2 bg-cream-warm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-error mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="edubaza"
                    className="w-full px-3.5 py-2 bg-cream-warm border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {formErrors.slug && (
                    <p className="text-xs text-error mt-1">{formErrors.slug}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink mb-1">Sayt Havolasi (URL) *</label>
                  <input
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
                      setFormData({
                        ...formData,
                        url: val,
                        domain: dom || formData.domain,
                      });
                    }}
                    placeholder="https://edubaza.uz"
                    className="w-full px-3.5 py-2 bg-cream-warm border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {formErrors.url && (
                    <p className="text-xs text-error mt-1">{formErrors.url}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Domen Nomi *</label>
                  <input
                    type="text"
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="edubaza.uz"
                    className="w-full px-3.5 py-2 bg-cream-warm border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {formErrors.domain && (
                    <p className="text-xs text-error mt-1">{formErrors.domain}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-ink mb-1">Kategoriya *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as "Startup MVP" | "EdTech" | "AI Bot" | "B2B SaaS",
                      })
                    }
                    className="w-full px-3.5 py-2 bg-cream-warm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {PORTFOLIO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Foydalanuvchilar Soni Metrikasi</label>
                  <input
                    type="text"
                    value={formData.userCount}
                    onChange={(e) => setFormData({ ...formData, userCount: e.target.value })}
                    placeholder="27 000+ o'qituvchi foydalanadi"
                    className="w-full px-3.5 py-2 bg-cream-warm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">Tavsif (Description) *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="O'qituvchilar uchun interaktiv ta'lim resurslari platformasi"
                  className="w-full px-3.5 py-2 bg-cream-warm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
                {formErrors.description && (
                  <p className="text-xs text-error mt-1">{formErrors.description}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-ink">Rasm Havolasi (Image URL)</label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (formData.url && formData.url !== "https://") {
                        const og = await fetchOgImage(formData.url);
                        if (og) {
                          setFormData((prev) => ({ ...prev, imageUrl: og }));
                          showToast("Saytdan rasm topildi!");
                        } else {
                          showToast("Saytdan rasm topilmadi (standart ko'rinish ishlatiladi)");
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Saytdan rasm olish (OG)</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Bo'sh qoldirilsa, avtomatik standart dizayn ko'rsatiladi"
                  className="w-full px-3.5 py-2 bg-cream-warm border border-border rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {formData.imageUrl && (
                  <div className="mt-2.5 rounded-lg border border-border overflow-hidden bg-cream-deep aspect-[16/10] max-h-40">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover object-top"
                      onError={() => {
                        setFormData((prev) => ({ ...prev, imageUrl: "" }));
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-accent focus:ring-accent"
                  />
                  <span>Bosh sahifada ko&apos;rsatish (Top 6)</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-ink-muted">Tartib:</span>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-16 px-2 py-1 bg-cream-warm border border-border rounded-lg font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream-warm text-ink hover:bg-cream-deep font-semibold"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-accent text-white font-semibold shadow-sm hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? "Saqlanmoqda..." : editingItem ? "Yangilash" : "Qo'shish"}</span>
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
