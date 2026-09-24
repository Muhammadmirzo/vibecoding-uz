"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Sparkles, X } from "lucide-react";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";
import { PortfolioFormFields } from "./PortfolioFormFields";
import type { PortfolioFormData } from "./types";

type Props = {
  open: boolean;
  editingItem: PortfolioItem | null;
  formData: PortfolioFormData;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (data: PortfolioFormData) => void;
  onSubmit: (event: React.FormEvent) => void;
  onToast: (message: string) => void;
};

export function PortfolioFormModal(props: Props) {
  return <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs animate-fade-in" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 space-y-5 overflow-y-auto rounded-2xl border border-border bg-bg-elevated p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Dialog.Title className="flex items-center gap-2 text-xl font-bold text-ink"><Sparkles className="size-5 text-accent" />{props.editingItem ? "Loyihani tahrirlash" : "Yangi loyiha qo'shish"}</Dialog.Title>
          <Dialog.Close className="grid size-11 place-items-center rounded-lg text-ink-muted hover:bg-bg-sunken" aria-label="Dialogni yopish"><X className="size-5" /></Dialog.Close>
        </div>
        <form className="space-y-5" onSubmit={props.onSubmit}>
          <PortfolioFormFields data={props.formData} errors={props.formErrors} onChange={props.onChange} onToast={props.onToast} />
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button type="button" onClick={() => props.onOpenChange(false)} className="min-h-11 rounded-xl bg-bg-sunken px-4 font-semibold text-ink">Bekor qilish</button>
            <button type="submit" disabled={props.isSubmitting} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-6 font-semibold text-ink disabled:opacity-50">{props.isSubmitting && <Loader2 className="size-4 animate-spin" />}{props.isSubmitting ? "Saqlanmoqda..." : "Saqlash"}</button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
