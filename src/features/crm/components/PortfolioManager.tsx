"use client";

import { CheckCircle2, Globe, Plus } from "lucide-react";
import { usePortfolio } from "./Portfolios/usePortfolio";
import { usePortfolioFilters } from "./Portfolios/usePortfolioFilters";
import { PortfolioTable } from "./Portfolios/PortfolioTable";
import { PortfolioFormModal } from "./Portfolios/PortfolioFormModal";
import { PortfolioFilters } from "./Portfolios/PortfolioFilters";

export function PortfolioManager() {
  const portfolio = usePortfolio();
  const filters = usePortfolioFilters(portfolio.items);
  return (
    <div className="space-y-6">
      {portfolio.toastMessage && <div role="status" className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-success/20 bg-bg-elevated px-4 py-3 text-sm font-semibold text-success shadow-xl"><CheckCircle2 className="h-4 w-4 shrink-0" /><span>{portfolio.toastMessage}</span></div>}
      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6"><div><h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink"><Globe className="h-6 w-6 text-accent" />Portfolio boshqaruvi</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">Platformadagi haqiqiy loyihalarni qo&apos;shing, tahrirlang va bosh sahifada ko&apos;rsatishni boshqaring.</p></div><button type="button" onClick={portfolio.openAdd} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-ink shadow-sm"><Plus className="h-4 w-4" />Yangi portfolio</button></header>
      <PortfolioFilters itemsCount={portfolio.items.length} searchQuery={filters.searchQuery} selectedCategory={filters.selectedCategory} onSearch={filters.setSearchQuery} onCategory={filters.setSelectedCategory} />
      <PortfolioTable items={filters.filteredItems} isLoading={portfolio.isLoading} onEdit={portfolio.openEdit} onDelete={portfolio.remove} onToggleFeatured={portfolio.toggleFeatured} />
      <PortfolioFormModal open={portfolio.isDialogOpen} editingItem={portfolio.editingItem} formData={portfolio.formData} formErrors={portfolio.formErrors} isSubmitting={portfolio.isSubmitting} onOpenChange={portfolio.setIsDialogOpen} onChange={portfolio.setFormData} onSubmit={portfolio.submit} onToast={portfolio.showToast} />
    </div>
  );
}
