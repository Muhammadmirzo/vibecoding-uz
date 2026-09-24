"use client";

import * as React from "react";
import { z } from "zod";
import { ArrowRight, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldError, Input, Label } from "@/components/ui/Form";
import { SuccessCheck } from "@/features/motion/ui/SuccessCheck";
import {
  formatPhoneMask,
  isValidTelegramUsername,
  isValidUzbekPhone,
} from "./phoneMask";

const leadFormSchema = z
  .object({
    name: z.string().min(2, "Ismingizni kiriting (kamida 2 belgi)."),
    phone: z.string().optional().default(""),
    telegram: z.string().optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (!isValidUzbekPhone(value.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Telefonni to'liq kiriting: +998 XX XXX-XX-XX.",
      });
    }
    if (value.telegram.trim() !== "" && !isValidTelegramUsername(value.telegram)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["telegram"],
        message: "Telegram username @ bilan boshlansin (@username).",
      });
    }
  });

export type LeadSource = "quiz" | "free_lesson" | "xizmatlar" | "meetlar" | "resurslar";

interface LeadCaptureFormProps {
  source: LeadSource;
  ctaLabel: string;
  title?: string;
  description?: string;
  quizAnswers?: Record<number, number>;
  recommendedCourseId?: string;
  revealUrl?: string;
  revealTitle?: string;
  revealText?: string;
  redirectUrl?: string;
  onSuccess?: (leadName: string) => void;
}

export function LeadCaptureForm({
  source,
  ctaLabel,
  title = "Keyingi qadamni ochish uchun ma'lumot qoldiring",
  description = "Natija va dars havolasi shu ma'lumotlar orqali beriladi.",
  quizAnswers,
  recommendedCourseId,
  revealUrl,
  revealTitle = "So'rovingiz qabul qilindi",
  revealText = "Tez orada siz bilan bog'lanamiz.",
  redirectUrl,
  onSuccess,
}: LeadCaptureFormProps) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [telegram, setTelegram] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string; phone?: string; telegram?: string }>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setPhone(raw.trim() === "" ? "" : formatPhoneMask(raw));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    const parsed = leadFormSchema.safeParse({ name: name.trim(), phone, telegram: telegram.trim() });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof errors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          phone: parsed.data.phone,
          telegram: parsed.data.telegram || undefined,
          source,
          quizAnswers: quizAnswers ?? undefined,
          recommendedCourseId: recommendedCourseId ?? undefined,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setServerError(data?.error ?? "Yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
        return;
      }
      setDone(true);
      onSuccess?.(parsed.data.name);
      if (redirectUrl) window.location.href = redirectUrl;
    } catch {
      setServerError("Tarmoqda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  if (done && !redirectUrl) {
    return (
      <div className="space-y-4 py-4 text-center" role="status">
        <div className="mx-auto flex size-12 items-center justify-center">
          <SuccessCheck size={48} label="So'rovingiz qabul qilindi" />
        </div>
        <h3 className="font-display text-xl font-semibold text-ink">{revealTitle}</h3>
        <p className="mx-auto max-w-md text-sm text-ink-muted">
          Rahmat, <strong className="text-ink">{name.trim()}</strong>! {revealText}
        </p>
        {revealUrl && (
          <Button href={revealUrl} variant="telegram" size="lg" className="w-full">
            <Send className="size-4" aria-hidden="true" /> Telegram orqali davom etish
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={title} className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>
      {serverError && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
          {serverError}
        </p>
      )}
      <div>
        <Label htmlFor={`lead-name-${source}`}>Ismingiz</Label>
        <Input
          id={`lead-name-${source}`}
          type="text"
          autoComplete="name"
          placeholder="Ismingizni kiriting"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(errors.name) || undefined}
        />
        {errors.name && <FieldError>{errors.name}</FieldError>}
      </div>
      <div>
        <Label htmlFor={`lead-phone-${source}`}>Telefon raqam</Label>
        <Input
          id={`lead-phone-${source}`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          value={phone}
          onChange={handlePhoneChange}
          aria-invalid={Boolean(errors.phone) || undefined}
          aria-describedby={`lead-phone-hint-${source}`}
        />
        <p id={`lead-phone-hint-${source}`} className="mt-1 text-xs text-ink-subtle">
          +998 formatda to'liq kiriting.
        </p>
        {errors.phone && <FieldError>{errors.phone}</FieldError>}
      </div>
      <div>
        <Label htmlFor={`lead-tg-${source}`}>
          Telegram username <span className="font-normal text-ink-subtle">(ixtiyoriy)</span>
        </Label>
        <Input
          id={`lead-tg-${source}`}
          type="text"
          autoComplete="off"
          placeholder="@username"
          value={telegram}
          onChange={(event) => setTelegram(event.target.value.replace(/\s/g, "").slice(0, 33))}
          aria-invalid={Boolean(errors.telegram) || undefined}
        />
        {errors.telegram && <FieldError>{errors.telegram}</FieldError>}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Yuborilmoqda...</>
        ) : (
          <>{ctaLabel} <ArrowRight className="size-4" aria-hidden="true" /></>
        )}
      </Button>
    </form>
  );
}
