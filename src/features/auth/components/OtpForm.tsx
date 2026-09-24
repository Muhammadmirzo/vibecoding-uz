"use client";

import { ArrowLeft, CircleAlert, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { FieldError } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export function OtpForm() {
  const { verifyOtp, login, pendingPhone, devCode, setAuthStep, isLoading, error, clearError } = useAuth();
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyInFlight = useRef(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = window.setInterval(() => setTimer((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [timer]);

  async function submitCode(value: string) {
    if (value.length !== OTP_LENGTH || isLoading || verifyInFlight.current) return;
    verifyInFlight.current = true;
    try {
      await verifyOtp(value);
    } finally {
      verifyInFlight.current = false;
    }
  }

  function handleInputChange(index: number, value: string) {
    if (error) clearError();
    const digitsOnly = value.replace(/\D/g, "");
    const nextCode = [...code];

    if (digitsOnly.length > 1) {
      const pasted = digitsOnly.slice(0, OTP_LENGTH).split("");
      pasted.forEach((digit, pasteIndex) => {
        nextCode[pasteIndex] = digit;
      });
      setCode(nextCode);
      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
      if (nextCode.join("").length === OTP_LENGTH) void submitCode(nextCode.join(""));
      return;
    }

    nextCode[index] = digitsOnly;
    setCode(nextCode);
    if (digitsOnly && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (nextCode.join("").length === OTP_LENGTH) void submitCode(nextCode.join(""));
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCode(code.join(""));
  }

  async function handleResend() {
    if (timer > 0 || isLoading) return;
    const success = await login(pendingPhone);
    if (success) {
      setTimer(RESEND_SECONDS);
      setCode(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    }
  }

  const fullCode = code.join("");

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Tasdiqlash kodi shakli" noValidate>
      <fieldset className="min-w-0 border-0 p-0">
        <div className="mb-2 flex items-center justify-between gap-2">
          <legend className="text-sm font-semibold text-ink">SMS orqali kelgan 6 xonali kod</legend>
          <button
            type="button"
            onClick={() => setAuthStep("login")}
            className="inline-flex min-h-11 items-center gap-1 rounded-md px-1 text-xs font-semibold text-brand hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            O&apos;zgartirish
          </button>
        </div>

        <div className="mb-4 rounded-md border border-border bg-bg-sunken p-3 text-xs leading-5 text-ink-muted">
          <span>Yuborildi: <strong className="font-mono text-ink">{pendingPhone}</strong></span>
          {devCode ? (
            <span className="mt-1 block font-semibold text-accent">Test kod: {devCode}</span>
          ) : (
            <span className="mt-1 block">Kod kelmasa — spam/junk qutini tekshiring yoki qayta yuboring.</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2" aria-describedby="otp-hint">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(element) => { inputRefs.current[index] = element; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              disabled={isLoading}
              value={digit}
              onChange={(event) => handleInputChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              className="h-12 min-w-0 flex-1 rounded-md border border-border-strong bg-bg-elevated text-center font-mono text-xl font-bold text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
              aria-label={`Kodning ${index + 1}-raqamli maydoni`}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "otp-error otp-hint" : "otp-hint"}
            />
          ))}
        </div>
        <p id="otp-hint" className="mt-1.5 text-xs text-ink-muted">Kodni kiritishingiz mumkin yoki SMS'dan nusxa olishingiz mumkin.</p>
      </fieldset>

      {error && (
        <FieldError id="otp-error" role="alert" className="flex items-start gap-2">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </FieldError>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isLoading || fullCode.length !== OTP_LENGTH}>
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>Kod tekshirilmoqda...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            <span>Tasdiqlash va kirish</span>
          </>
        )}
      </Button>

      <div className="pt-1 text-center">
        {timer > 0 ? (
          <p className="font-mono text-xs text-ink-muted">Kodni qayta yuborish: <span className="font-bold text-ink">{timer}s</span></p>
        ) : (
          <button type="button" onClick={handleResend} disabled={isLoading} className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-brand hover:underline disabled:opacity-50">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Kodni qayta yuborish
          </button>
        )}
      </div>
    </form>
  );
}
