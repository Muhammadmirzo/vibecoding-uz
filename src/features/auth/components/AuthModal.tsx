"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "./LoginForm";
import { OtpForm } from "./OtpForm";
import { X, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authStep, toastMessage, toastType } = useAuth();

  return (
    <Dialog.Root open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity" />
        
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] p-6 sm:p-8 bg-[var(--color-cream)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] rounded-[var(--radius-lg)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Vibecoding platformasi</span>
              </div>
              <Dialog.Title className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)] font-serif italic">
                {authStep === "login" ? "Tizimga kirish" : "Kodni tasdiqlash"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {authStep === "login"
                  ? "Platformaga kirish va bilimlarni o'zlashtirish uchun telefon raqamingizni kiriting"
                  : "Sizning telefon raqamingizga yuborilgan tasdiqlash kodini kiriting"}
              </Dialog.Description>
            </div>

            <Dialog.Close
              onClick={closeAuthModal}
              className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div
              role="status"
              className={`mb-4 flex items-start gap-2 p-3 rounded-[var(--radius-md)] text-sm font-medium animate-fadeIn ${
                toastType === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
              }`}
            >
              {toastType === "success" ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Form Content */}
          {authStep === "login" ? <LoginForm /> : <OtpForm />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
