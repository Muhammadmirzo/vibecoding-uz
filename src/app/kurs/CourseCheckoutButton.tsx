"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourseCtaState } from "./cta";

export function CourseCheckoutButton({ compact = false }: { compact?: boolean }) {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const ctaState = getCourseCtaState({ isAuthenticated: Boolean(user), hasConfiguredProvider: true });

  const handleClick = () => {
    if (ctaState === "login") {
      openAuthModal("login", "/kabinet/to-lovlar");
    } else {
      router.push("/kabinet/to-lovlar");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-press inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold font-semibold text-on-gold shadow-sm transition-colors hover:bg-gold-hover ${compact ? "min-h-11 px-4 text-sm" : "min-h-12 px-5 text-base"}`}
    >
      {ctaState === "login" ? (compact ? "Kirish" : "Kursga o'tish uchun kiring") : (compact ? "Yozilish" : "Kursga yozilish")}
      <ArrowRight className="size-4" aria-hidden="true" />
    </button>
  );
}
