"use client";

import * as React from "react";
import { PORTFOLIO_DATA, type PortfolioItem } from "@/features/portfolio/portfolioData";
import { portfolioSchema } from "@/lib/validations/portfolio";
import { resolvePortfolioImageUrl } from "@/features/portfolio/portfolioUtils";
import type { PortfolioFormData } from "./types";

const initialForm: PortfolioFormData = {
  title: "", slug: "", url: "https://", domain: "", category: "Startup MVP", description: "",
  imageUrl: "", userCount: "", badgeText: "Shu metod bilan qurilgan", isFeatured: true, sortOrder: 1,
};

export function usePortfolio() {
  const [items, setItems] = React.useState<PortfolioItem[]>(PORTFOLIO_DATA);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PortfolioItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState<PortfolioFormData>(initialForm);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  React.useEffect(() => {
    fetch("/api/portfolio").then((res) => res.json()).then((data) => {
      if (data.success && Array.isArray(data.portfolios) && data.portfolios.length > 0) setItems(data.portfolios);
    }).catch((err) => console.error("Error fetching portfolios:", err)).finally(() => setIsLoading(false));
  }, []);

  const openAdd = () => { setEditingItem(null); setFormData({ ...initialForm, sortOrder: items.length + 1 }); setFormErrors({}); setIsDialogOpen(true); };
  const openEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({ title: item.title, slug: item.slug, url: item.url, domain: item.domain, category: item.category, description: item.description, imageUrl: resolvePortfolioImageUrl(item), userCount: item.userCount || "", badgeText: item.badgeText, isFeatured: item.isFeatured, sortOrder: item.sortOrder });
    setFormErrors({}); setIsDialogOpen(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setFormErrors({});
    const validated = portfolioSchema.safeParse(formData);
    if (!validated.success) {
      const errors: Record<string, string> = {};
      const fields = validated.error.flatten().fieldErrors;
      (Object.keys(fields) as Array<keyof typeof fields>).forEach((key) => { const value = fields[key]; if (value?.[0]) errors[key] = value[0]; });
      setFormErrors(errors); return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(editingItem ? `/api/portfolio/${editingItem.id}` : "/api/portfolio", { method: editingItem ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validated.data) });
      const data = await response.json();
      const item: PortfolioItem = data.portfolio || (editingItem ? { ...editingItem, ...validated.data } : { ...validated.data, id: `portfolio-${Date.now()}` });
      setItems((current) => editingItem ? current.map((entry) => entry.id === editingItem.id ? item : entry) : [item, ...current]);
      showToast(editingItem ? "Portfolio loyihasi yangilandi!" : "Yangi portfolio loyihasi qo'shildi!"); setIsDialogOpen(false);
    } catch (err) { console.error(err); showToast("Xatolik yuz berdi"); } finally { setIsSubmitting(false); }
  };
  const remove = async (id: string, title: string) => {
    if (!confirm(`Haqiqatan ham "${title}" portfoliosini o'chirmoqchimisiz?`)) return;
    try { await fetch(`/api/portfolio/${id}`, { method: "DELETE" }); setItems((current) => current.filter((entry) => entry.id !== id)); showToast("Portfolio o'chirildi"); }
    catch (err) { console.error(err); setItems((current) => current.filter((entry) => entry.id !== id)); showToast("Portfolio o'chirildi"); }
  };
  const toggleFeatured = async (item: PortfolioItem) => { const next = !item.isFeatured; setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, isFeatured: next } : entry)); try { await fetch(`/api/portfolio/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isFeatured: next }) }); showToast("Status yangilandi!"); } catch (err) { console.error(err); } };
  return { items, isLoading, isDialogOpen, editingItem, isSubmitting, toastMessage, formErrors, formData, setFormData, setIsDialogOpen, showToast, openAdd, openEdit, submit, remove, toggleFeatured };
}
