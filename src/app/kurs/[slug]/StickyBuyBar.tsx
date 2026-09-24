"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { getCourseCtaState } from "../cta";

export function StickyBuyBar({ price, title }: { price: string; title: string }) {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const ctaState = getCourseCtaState({ isAuthenticated: Boolean(user), hasConfiguredProvider: true });

  const handleClick = () => {
    if (ctaState === "login") openAuthModal("login");
    else router.push("/kabinet/to-lovlar");
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-elevated/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-container items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-ink">{title}</p>
          <p className="font-display text-base font-semibold text-brand">{price}</p>
        </div>
        <Button onClick={handleClick} className="shrink-0">
          {ctaState === "login" ? "Kirish" : "Band qilish"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
