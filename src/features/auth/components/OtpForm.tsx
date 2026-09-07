"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export function OtpForm() {
  const { verifyOtp, login, pendingPhone, devCode, setAuthStep, isLoading, error, clearError } = useAuth();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState<number>(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Focus initial input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (error) clearError();
    const digitsOnly = value.replace(/\D/g, "");
    
    if (!digitsOnly) {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
      return;
    }

    // Handle paste of full 6 digits
    if (digitsOnly.length > 1) {
      const pasted = digitsOnly.slice(0, 6).split("");
      const newCode = [...code];
      pasted.forEach((char, i) => {
        if (i < 6) newCode[i] = char;
      });
      setCode(newCode);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = digitsOnly;
    setCode(newCode);

    // Auto-advance
    if (digitsOnly && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when complete 6 digits
    const updatedFullCode = newCode.join("");
    if (updatedFullCode.length === 6) {
      verifyOtp(updatedFullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6 || isLoading) return;
    await verifyOtp(fullCode);
  };

  const handleResend = async () => {
    if (timer > 0 || isLoading) return;
    const success = await login(pendingPhone);
    if (success) {
      setTimer(60);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="OTP tasdiqlash shakli">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-[var(--color-ink)]">
            SMS orqali kelgan 6 xonali kod
          </label>
          <button
            type="button"
            onClick={() => setAuthStep("login")}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            O'zgartirish
          </button>
        </div>

        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-cream-warm)] border border-[var(--color-border)] mb-4 text-xs text-[var(--color-ink-muted)] flex items-center justify-between">
          <span>Yuborildi: <strong className="font-mono text-[var(--color-ink)]">{pendingPhone}</strong></span>
          {devCode ? (
            <span className="text-[var(--color-accent)] font-semibold">(Dev kod: {devCode})</span>
          ) : (
            <span className="text-[var(--color-accent)] font-semibold">(Demo kod: 123456)</span>
          )}
        </div>

        {/* 6 Digit PIN Inputs */}
        <div className="flex items-center justify-between gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              disabled={isLoading}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-13 text-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cream-warm)] text-[var(--color-ink)] font-mono text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all disabled:opacity-50"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || code.join("").length !== 6}
        className="w-full h-12 rounded-[var(--radius-md)] btn-primary font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Kodni tekshirilmoqda...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            <span>Tasdiqlash va Kirish</span>
          </>
        )}
      </button>

      {/* Resend timer */}
      <div className="text-center pt-1">
        {timer > 0 ? (
          <p className="text-xs text-[var(--color-ink-muted)] font-mono">
            Kodni qayta yuborish: <span className="font-bold text-[var(--color-ink)]">{timer}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Kodni qayta yuborish</span>
          </button>
        )}
      </div>
    </form>
  );
}
