"use client";
import * as React from "react";

import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Gift,
  Loader2,
} from "lucide-react";
import { useReferral } from "./useReferral";

export function PayoutModal({
  stats,
  payoutMethod,
  setPayoutMethod,
  cardNumber,
  setCardNumber,
  cardHolder,
  setCardHolder,
  payoutLoading,
  payoutSuccess,
  setPayoutModalOpen,
  payoutError,
  handlePayoutSubmit,
}: ReturnType<typeof useReferral>) {
  return (
    <Dialog.Root open={true} onOpenChange={setPayoutModalOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-cream border border-border-strong rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-150 text-ink">
          <div className="pb-4 border-b border-border">
            <Dialog.Title className="text-xl font-bold text-ink">
              Referral Bonusini Yechib Olish
            </Dialog.Title>
            <Dialog.Description className="text-xs text-ink-muted">
              Mavjud balans:{" "}
              <strong className="text-accent font-mono">
                {stats.balance.toLocaleString("uz-UZ")} UZS
              </strong>
            </Dialog.Description>
          </div>
          {payoutSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-ink">
                So'rov qabul qilindi!
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                24 soat ichida ko'rsatilgan kartangizga{" "}
                <strong>{stats.balance.toLocaleString("uz-UZ")} UZS</strong>{" "}
                mablag' o'tkazib beriladi.
              </p>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="btn-primary h-10 px-6 rounded-lg text-xs font-semibold mt-3"
              >
                Tushunarli
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayoutSubmit} className="space-y-4 pt-4">
              {payoutError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{payoutError}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">
                  Qabul qilish usuli
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("uzcard_humo")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${payoutMethod === "uzcard_humo" ? "border-accent bg-accent-soft text-accent shadow-sm" : "border-border bg-cream-warm text-ink-muted"}`}
                  >
                    <CreditCard className="w-4 h-4" /> Uzcard / Humo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("course_balance")}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${payoutMethod === "course_balance" ? "border-accent bg-accent-soft text-accent shadow-sm" : "border-border bg-cream-warm text-ink-muted"}`}
                  >
                    <Gift className="w-4 h-4" /> Kurs to'loviga
                  </button>
                </div>
              </div>
              {payoutMethod === "uzcard_humo" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">
                      Karta raqami (16 xonali) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="8600 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 16),
                        )
                      }
                      className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream-warm text-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-ink">
                      Karta egasi ismi (F.I.SH.)
                    </label>
                    <input
                      type="text"
                      placeholder="JAMSHID ALIMOV"
                      value={cardHolder}
                      onChange={(e) =>
                        setCardHolder(e.target.value.toUpperCase())
                      }
                      className="w-full h-11 px-3.5 rounded-lg border border-border-strong bg-cream-warm text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </>
              )}
              <div className="p-3 rounded-lg bg-cream-warm border border-border text-xs flex items-center justify-between">
                <span className="text-ink-muted">Yechilayotgan summa:</span>
                <strong className="text-accent font-mono">
                  {stats.balance.toLocaleString("uz-UZ")} UZS
                </strong>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="btn-secondary h-10 px-4 rounded-lg text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="btn-primary h-10 px-6 rounded-lg text-xs font-semibold inline-flex items-center gap-2"
                >
                  {payoutLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4" />
                  )}
                  <span>Yechish so'rovini yuborish</span>
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
