"use client";

import * as React from "react";
import { z } from "zod";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";
import { portfolioListResponseSchema, portfolioSchema, portfolioWriteResponseSchema, type PortfolioUpdateInput } from "@/lib/validations/portfolio";
import type { PortfolioFormData } from "./types";

const initialForm: PortfolioFormData = {
  title: "", slug: "", url: "https://", domain: "", category: "Startup MVP", description: "",
  imageUrl: "", coverUrl: "", liveUrl: "", repoUrl: "", userCount: "", badgeText: "Naqsh metodi bilan qurilgan",
  isFeatured: false, featuredRank: null, sortOrder: 1, ownership: "owner", status: "draft",
  techStack: "", highlights: "", publishedAt: "",
};
const errorBodySchema = z.object({ message: z.string().optional(), error: z.string().optional() }).passthrough();

function fromItem(item: PortfolioItem): PortfolioFormData {
  return {
    title: item.title, slug: item.slug, url: item.url, domain: item.domain, category: item.category as PortfolioFormData["category"],
    description: item.description, imageUrl: item.imageUrl, coverUrl: item.coverUrl, liveUrl: item.liveUrl, repoUrl: item.repoUrl,
    userCount: item.userCount || "", badgeText: item.badgeText, isFeatured: item.isFeatured, featuredRank: item.featuredRank,
    sortOrder: item.sortOrder, ownership: item.ownership, status: item.status, techStack: item.techStack.join(", "),
    highlights: item.highlights.join("\n"), publishedAt: item.publishedAt?.slice(0, 16) || "",
  };
}

async function requestJson(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  const body: unknown = await response.json();
  if (!response.ok) {
    const parsed = errorBodySchema.safeParse(body);
    throw new Error(parsed.success ? (parsed.data.message || parsed.data.error) : "Amalni bajarishda xatolik yuz berdi");
  }
  return body;
}

export function usePortfolio() {
  const [items, setItems] = React.useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PortfolioItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState<PortfolioFormData>(initialForm);
  const showToast = (message: string) => { setToastMessage(message); window.setTimeout(() => setToastMessage(null), 3500); };

  const load = React.useCallback(async () => {
    const body = await requestJson("/api/portfolio?scope=admin");
    const parsed = portfolioListResponseSchema.parse(body);
    setItems(parsed.portfolios.map((item) => ({ ...item, publishedAt: item.publishedAt ?? null })));
  }, []);

  React.useEffect(() => { load().catch((error: unknown) => showToast(error instanceof Error ? error.message : "Loyihalarni yuklab bo'lmadi")).finally(() => setIsLoading(false)); }, [load]);

  const openAdd = () => { setEditingItem(null); setFormData({ ...initialForm, sortOrder: items.length + 1 }); setFormErrors({}); setIsDialogOpen(true); };
  const openEdit = (item: PortfolioItem) => { setEditingItem(item); setFormData(fromItem(item)); setFormErrors({}); setIsDialogOpen(true); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setFormErrors({});
    const { publishedAt, techStack, highlights, ...formValues } = formData;
    const candidate = { ...formValues, imageUrl: formData.coverUrl, liveUrl: formData.liveUrl || formData.url, publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null, techStack: techStack.split(",").map((v) => v.trim()).filter(Boolean), highlights: highlights.split("\n").map((v) => v.trim()).filter(Boolean) };
    const validated = portfolioSchema.safeParse(candidate);
    if (!validated.success) {
      const fields = validated.error.flatten().fieldErrors;
      setFormErrors(Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value?.[0] || "Qiymat noto'g'ri"])));
      return;
    }
    setIsSubmitting(true);
    try {
      const body = await requestJson(editingItem ? `/api/portfolio/${editingItem.id}` : "/api/portfolio", { method: editingItem ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validated.data) });
      portfolioWriteResponseSchema.parse(body);
      await load(); setIsDialogOpen(false); showToast(editingItem ? "Loyiha yangilandi" : "Yangi loyiha qo'shildi");
    } catch (error) { showToast(error instanceof Error ? error.message : "Xatolik yuz berdi"); }
    finally { setIsSubmitting(false); }
  };

  const patch = async (item: PortfolioItem, body: PortfolioUpdateInput) => {
    const response = await requestJson(`/api/portfolio/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    portfolioWriteResponseSchema.parse(response); await load();
  };
  const remove = async (item: PortfolioItem) => {
    if (!window.confirm(`Haqiqatan ham "${item.title}" loyihasini o'chirmoqchimisiz?`)) return;
    try { await requestJson(`/api/portfolio/${item.id}`, { method: "DELETE" }); await load(); showToast("Loyiha o'chirildi"); }
    catch (error) { showToast(error instanceof Error ? error.message : "Xatolik yuz berdi"); }
  };
  const toggleFeatured = async (item: PortfolioItem) => {
    try { await patch(item, { isFeatured: !item.isFeatured, featuredRank: !item.isFeatured ? items.filter((entry) => entry.isFeatured).length + 1 : null }); showToast("Asosiy loyihalar holati yangilandi"); }
    catch (error) { showToast(error instanceof Error ? error.message : "Xatolik yuz berdi"); }
  };
  const move = async (item: PortfolioItem, direction: -1 | 1) => {
    const index = items.findIndex((entry) => entry.id === item.id); const target = items[index + direction];
    if (!target) return;
    // Swap positions; equal sortOrders (legacy rows) would make a swap a no-op, so push the item past its neighbour.
    const itemOrder = target.sortOrder === item.sortOrder ? Math.max(0, target.sortOrder + direction) : target.sortOrder;
    try { await patch(item, { sortOrder: itemOrder }); await patch(target, { sortOrder: item.sortOrder }); showToast("Tartib yangilandi"); }
    catch (error) { showToast(error instanceof Error ? error.message : "Tartibni yanglab bo'lmadi"); }
  };
  const setQuickField = async (item: PortfolioItem, body: PortfolioUpdateInput, message: string) => {
    try { await patch(item, body); showToast(message); }
    catch (error) { showToast(error instanceof Error ? error.message : "Xatolik yuz berdi"); await load(); }
  };

  return { items, isLoading, isDialogOpen, editingItem, isSubmitting, toastMessage, formErrors, formData, setFormData, setIsDialogOpen, showToast, openAdd, openEdit, submit, remove, toggleFeatured, move, setQuickField };
}
