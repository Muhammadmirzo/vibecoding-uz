"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

export const TeaserBanner = React.memo(function TeaserBanner() {
  return (
    <section className="w-full py-8 md:py-12 bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="bg-cream-warm border border-border-strong rounded-xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1">
            <div className="p-3 sm:p-3.5 md:p-4 rounded-xl bg-accent-soft text-accent flex-shrink-0">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-ink">
                Platforma ichida nima bor?
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-ink-muted leading-relaxed">
                Bepul darsga kirganingizda ochiladi: video dars, tayyor promptlar, uy vazifa — hammasi bilan.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex-shrink-0">
            <Link href="/bepul-dars" prefetch={true} className="w-full sm:w-auto inline-block">
              <button className="inline-flex items-center justify-center gap-2 rounded-md font-semibold btn-primary h-12 px-6 text-sm w-full sm:w-auto">
                <span>Bepul darsni ochish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});
