"use client";

import { ArrowRight, CircleAlert, Loader2, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { FieldError, Input, Label } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

const PHONE_DIGITS = 9;

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  const localDigits = digits.startsWith("998") ? digits.slice(3) : digits;
  const limited = localDigits.slice(0, PHONE_DIGITS);
  const groups = [limited.slice(0, 2), limited.slice(2, 5), limited.slice(5, 7), limited.slice(7, 9)];
  return groups.filter(Boolean).reduce((formatted, group, index) => {
    if (index === 0) return group;
    return `${formatted}${index === 1 ? " " : "-"}${group}`;
  }, "");
}

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [phoneInput, setPhoneInput] = useState("");
  const digits = phoneInput.replace(/\D/g, "");
  const isPhoneValid = digits.length === PHONE_DIGITS;

  function handlePhoneChange(value: string) {
    if (error) clearError();
    setPhoneInput(formatPhoneNumber(value));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPhoneValid || isLoading) return;
    const cleanDigits = phoneInput.replace(/\D/g, "");
    const fullPhone = cleanDigits.startsWith("998") ? `+${cleanDigits}` : `+998${cleanDigits}`;
    await login(fullPhone);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Tizimga kirish shakli" noValidate>
      <div>
        <Label htmlFor="phone-input">Telefon raqamingiz</Label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 flex items-center gap-1.5 text-sm font-medium text-ink-muted">
            <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>+998</span>
          </div>
          <Input
            id="phone-input"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            required
            disabled={isLoading}
            value={phoneInput}
            onChange={(event) => handlePhoneChange(event.target.value)}
            placeholder="90 123-45-67"
            className="h-11 pl-20 font-mono text-base"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-error login-hint" : "login-hint"}
          />
        </div>
        <p id="login-hint" className="mt-1.5 text-xs text-ink-muted">
          SMS orqali bir marta ishlatiladigan tasdiqlash kodi yuboriladi.
        </p>
        {error && (
          <FieldError id="login-error" role="alert" className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </FieldError>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading || !isPhoneValid}>
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>SMS yuborilmoqda...</span>
          </>
        ) : (
          <>
            <span>Kodni olish</span>
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
