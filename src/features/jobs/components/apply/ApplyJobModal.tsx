"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, CheckCircle2 } from "lucide-react";
import { ModalApplyFields } from "./ModalApplyFields";
import { useApplyForm } from "./ApplyForm";
import type { ApplyJobModalProps } from "./types";

export type { ApplyJobModalProps, ApplyJobTarget } from "./types";

export function ApplyJobModal({ isOpen, onClose, job }: ApplyJobModalProps) {
  const form = useApplyForm(job, isOpen);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-bg border border-border-strong rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 text-ink">
          <div className="flex items-start justify-between pb-4 border-b border-border">
            <div className="space-y-1 pr-6">
              <span className="text-xs font-mono font-bold text-accent uppercase">{job.department}</span>
              <Dialog.Title className="text-xl md:text-2xl font-bold text-ink leading-snug">{job.title}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="size-11 rounded-lg flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-bg-sunken transition-colors" aria-label="Yopish">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          {form.success ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-extrabold text-ink">Arizangiz qabul qilindi!</h3>
              <p className="text-xs md:text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
                Rahmat, <strong className="text-ink">{form.fullName}</strong>. Bizning HR jamoamiz 24 soat ichida <strong className="text-ink">{form.phone}</strong> raqami yoki Telegram orqali siz bilan bog'lanadi.
              </p>
              <div className="pt-4">
                <button onClick={onClose} className="min-h-11 rounded-lg bg-gold px-8 text-xs font-semibold text-ink">Tushunarli</button>
              </div>
            </div>
          ) : (
            <ModalApplyFields form={form} />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
