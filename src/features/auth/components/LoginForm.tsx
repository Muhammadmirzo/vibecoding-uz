"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Phone, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [phoneInput, setPhoneInput] = useState<string>("");

  const formatPhoneNumber = (value: string) => {
    // Strip all non-numeric characters
    const digits = value.replace(/\D/g, "");
    
    // If starts with 998, keep or strip
    let localDigits = digits;
    if (digits.startsWith("998")) {
      localDigits = digits.slice(3);
    }
    
    // Format up to 9 digits: XX XXX-XX-XX
    const limited = localDigits.slice(0, 9);
    let formatted = "";
    
    if (limited.length > 0) {
      formatted += limited.slice(0, 2);
    }
    if (limited.length > 2) {
      formatted += " " + limited.slice(2, 5);
    }
    if (limited.length > 5) {
      formatted += "-" + limited.slice(5, 7);
    }
    if (limited.length > 7) {
      formatted += "-" + limited.slice(7, 9);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneInput(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || isLoading) return;
    
    // Normalize to full phone
    const cleanDigits = phoneInput.replace(/\D/g, "");
    const fullPhone = cleanDigits.startsWith("998") ? `+${cleanDigits}` : `+998${cleanDigits}`;
    await login(fullPhone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-label="Tizimga kirish shakli">
      <div>
        <label htmlFor="phone-input" className="block text-sm font-semibold text-[var(--color-ink)] mb-2">
          Telefon raqamingiz
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--color-ink-muted)] text-sm font-medium">
            <Phone className="w-4 h-4 mr-1.5 text-[var(--color-accent)]" />
            <span>+998</span>
          </div>
          <input
            id="phone-input"
            type="tel"
            required
            autoFocus
            disabled={isLoading}
            value={phoneInput}
            onChange={handlePhoneChange}
            placeholder="90 123-45-67"
            className="w-full h-12 pl-20 pr-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cream-warm)] text-[var(--color-ink)] font-mono text-base placeholder-[var(--color-ink-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all disabled:opacity-50"
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
          SMS orqali bir marta ishlatiladigan tasdiqlash kodi yuboriladi
        </p>
      </div>

      {error && (
        <div
          id="login-error"
          role="alert"
          className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || phoneInput.replace(/\D/g, "").length < 9}
        className="w-full h-12 rounded-[var(--radius-md)] btn-primary font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>SMS yuborilmoqda...</span>
          </>
        ) : (
          <>
            <span>Kodni olish</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
