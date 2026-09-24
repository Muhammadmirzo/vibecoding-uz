"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, CircleAlert, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "./LoginForm";
import { OtpForm } from "./OtpForm";
import { TelegramAuthFlow } from "./TelegramAuthFlow";
import { TelegramLoginButton } from "./TelegramLoginButton";
import { BRAND } from "@/config/brand";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authStep, toastMessage, toastType } = useAuth();
  const isOtpStep = authStep === "otp";

  return (
    <Dialog.Root
      open={isAuthModalOpen}
      onOpenChange={(open) => {
        if (!open) closeAuthModal();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm data-[state=open]:animate-fade-up data-[state=closed]:opacity-0" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-auto -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-lg outline-none sm:inset-x-auto sm:left-1/2 sm:w-[calc(100%-3rem)] sm:-translate-x-1/2 sm:max-w-md sm:p-7 sm:pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:pt-[max(1.75rem,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold-hover">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{BRAND.name} platformasi</span>
              </div>
              <Dialog.Title className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {isOtpStep ? "Kodni tasdiqlash" : "Kirish yoki ro'yxatdan o'tish"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-6 text-ink-muted">
                {isOtpStep
                  ? "Telefoningizga yuborilgan tasdiqlash kodini kiriting."
                  : "Telegram orqali tez kirish yoki ro'yxatdan o'ting. Telefon orqali SMS bilan ham davom etishingiz mumkin."}
              </Dialog.Description>
            </div>
            <Dialog.Close
              onClick={closeAuthModal}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-bg-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Yopish"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-5">
            {toastMessage && (
              <div
                role="status"
                aria-live="polite"
                className={`mb-4 flex items-start gap-2 rounded-md border p-3 text-sm font-medium ${
                  toastType === "success"
                    ? "border-success-line bg-success-soft text-success"
                    : "border-danger/30 bg-danger-soft text-danger"
                }`}
              >
                {toastType === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span>{toastMessage}</span>
              </div>
            )}

            {isOtpStep ? <OtpForm /> : <>
              <TelegramAuthFlow />
              <div className="my-5 flex items-center gap-3" aria-hidden="true"><span className="h-px flex-1 bg-border" /><span className="text-xs font-medium text-ink-subtle">yoki telefon bilan</span><span className="h-px flex-1 bg-border" /></div>
              <LoginForm />
            </>}

            {process.env.NEXT_PUBLIC_TELEGRAM_WIDGET === "1" && <div className="mt-5" aria-label="Telegram kirish widgeti"><TelegramLoginButton /></div>}
            <div className="mt-4 border-t border-border pt-4 text-center">
              <a
                href="/admin/login"
                onClick={closeAuthModal}
                className="inline-flex min-h-11 items-center rounded-md px-2 font-mono text-xs text-brand hover:underline"
              >
                Admin yoki xodimlar uchun kirish &rarr;
              </a>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
