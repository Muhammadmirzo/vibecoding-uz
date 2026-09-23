"use client";

import * as React from "react";
import { applyJobSchema } from "@/lib/validations/jobs";
import { getFieldErrors, normalizePhone } from "./ApplyValidation";
import type { ApplyFormState, ApplyJobTarget } from "./types";

export function useApplyForm(
  job: ApplyJobTarget,
  isOpen = false,
  networkError = "Tarmoq xatosi. Iltimos aloqani tekshiring."
): ApplyFormState {
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("+998");
  const [telegramUsername, setTelegramUsername] = React.useState("");
  const [resumeUrl, setResumeUrl] = React.useState("");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");
  const [experience, setExperience] = React.useState("1-3 yil");
  const [coverLetter, setCoverLetter] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setErrors({});
    }
  }, [isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(normalizePhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const parseResult = applyJobSchema.safeParse({
      jobId: job.id,
      jobSlug: job.slug,
      jobTitle: job.title,
      fullName: fullName.trim(),
      phone: phone.trim(),
      telegramUsername: telegramUsername.trim() || undefined,
      resumeUrl: resumeUrl.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      experience,
      coverLetter: coverLetter.trim() || undefined,
    });
    if (!parseResult.success) {
      setErrors(getFieldErrors(parseResult));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ish/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });
      const resData = await res.json();
      if (!res.ok) {
        setErrors({ general: resData.error || "Ariza yuborishda xatolik yuz berdi" });
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch (err) {
      setErrors({ general: networkError });
    } finally {
      setLoading(false);
    }
  };

  const resetForAnotherApplication = () => {
    setSuccess(false);
    setFullName("");
    setPhone("+998");
    setCoverLetter("");
    setResumeUrl("");
  };

  return {
    fullName, phone, telegramUsername, resumeUrl, portfolioUrl, experience,
    coverLetter, loading, success, errors, setFullName, setPhone,
    setTelegramUsername, setResumeUrl, setPortfolioUrl, setExperience,
    setCoverLetter, handlePhoneChange, handleSubmit, resetForAnotherApplication,
  };
}
