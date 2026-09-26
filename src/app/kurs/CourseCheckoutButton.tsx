"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { buildCheckoutHref } from "@/features/payments/domain/checkout-target";
import { getCourseCtaState } from "./cta";

/**
 * Course CTA: send the visitor to the pay page for THIS course. Logged out,
 * the same URL is the post-login redirect, so the chosen course survives login.
 */
export function CourseCheckoutButton({
  courseSlug,
  compact = false,
}: {
  courseSlug: string;
  compact?: boolean;
}) {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const href = buildCheckoutHref(courseSlug);
  const ctaState = getCourseCtaState({ isAuthenticated: Boolean(user), hasConfiguredProvider: true });

  const handleClick = () => {
    if (ctaState === "login") {
      openAuthModal("login", href);
    } else {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-press inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold font-semibold text-on-gold shadow-sm transition-colors hover:bg-gold-hover ${compact ? "min-h-11 px-4 text-sm" : "min-h-12 px-5 text-base"}`}
    >
      {ctaState === "login" ? (compact ? "Kirish" : "Kursga o'tish uchun kiring") : (compact ? "Band qilish" : "Kursni band qilish")}
      <ArrowRight className="size-4" aria-hidden="true" />
    </button>
  );
}
