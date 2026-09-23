"use client";

import * as React from "react";
import { CheckCircle2, Globe, Plus } from "lucide-react";
import { usePortfolio } from "./Portfolios/usePortfolio";
import { PortfolioTable } from "./Portfolios/PortfolioTable";
import { PortfolioFormModal } from "./Portfolios/PortfolioFormModal";
import { PortfolioFilters } from "./Portfolios/PortfolioFilters";

export function PortfolioManager() {
  const portfolio = usePortfolio();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Barchasi");
  const filteredItems = React.useMemo(() => portfolio.items.filter((item) => {
    const category = selectedCategory === "Barchasi" || item.category === selectedCategory;
    const search = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.domain.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return category && search;
  }), [portfolio.items, searchQuery, selectedCategory]);
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {portfolio.toastMessage && <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-fade-in"><CheckCircle2 className="w-4 h-4 text-success shrink-0" /><span>{portfolio.toastMessage}</span></div>}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-warm border border-border p-6 rounded-2xl">
        <div><h1 className="text-2xl md:text-3xl font-extrabold text-ink flex items-center gap-2"><Globe className="w-7 h-7 text-accent" /><span>Portfolio Boshqaruvi</span></h1><p className="text-xs sm:text-sm text-ink-muted mt-1">Vibe Coding platformasida yaratilgan jonli loyihalar va portfolio kartalarini qo&apos;shing va tahrirlang.</p></div>
        <button onClick={portfolio.openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-sm hover:bg-accent-hover transition-all shrink-0"><Plus className="w-4 h-4" /><span>Yangi Portfolio Qo&apos;shish</span></button>
      </div>
      <PortfolioFilters itemsCount={portfolio.items.length} searchQuery={searchQuery} selectedCategory={selectedCategory} onSearch={setSearchQuery} onCategory={setSelectedCategory} />
      <PortfolioTable items={filteredItems} isLoading={portfolio.isLoading} onEdit={portfolio.openEdit} onDelete={portfolio.remove} onToggleFeatured={portfolio.toggleFeatured} />
      <PortfolioFormModal open={portfolio.isDialogOpen} editingItem={portfolio.editingItem} formData={portfolio.formData} formErrors={portfolio.formErrors} isSubmitting={portfolio.isSubmitting} onOpenChange={portfolio.setIsDialogOpen} onChange={portfolio.setFormData} onSubmit={portfolio.submit} onToast={portfolio.showToast} />
    </div>
  );
}
