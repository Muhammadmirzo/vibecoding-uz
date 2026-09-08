"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Footer = React.memo(function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-[var(--color-cream-deep)] border-t border-[var(--color-border-strong)] py-12 text-sm text-[var(--color-ink-muted)]">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" prefetch={true} className="flex items-center gap-2 font-bold text-lg text-[var(--color-ink)]">
              <span className="w-7 h-7 rounded-md bg-[var(--color-accent)] text-white flex items-center justify-center font-mono text-sm font-black">
                &gt;
              </span>
              <span className="font-black tracking-tight text-base whitespace-nowrap text-ink">
                vibe<span className="text-[var(--color-accent)]">coding</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[var(--color-ink-muted)]">
              AI bilan mahsulotlar qurishni jonli loyihalar muallifidan o'rganing. Dasturchilarsiz, g'oyadan ishlaydigan MVPgacha.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream border border-border text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Keyingi guruh: 15-Oktyabr
            </div>
          </div>

          {/* Col 2: Sayt Navigatsiyasi */}
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-3">
              Platforma
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link href="/kurs/vibe-coding-express" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Vibe Coding Express</Link></li>
              <li><Link href="/kurs/ai-asoslari" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">AI Asoslari</Link></li>
              <li><Link href="/blog" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Blog & Maqolalar</Link></li>
              <li><Link href="/testimoniyalar" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Bitiruvchilar Natijalari</Link></li>
              <li><Link href="/diagnostika" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Diagnostika Kvizi</Link></li>
              <li><Link href="/bepul-dars" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Bepul dars</Link></li>
            </ul>
          </div>

          {/* Col 3: Resurslar & Karyera */}
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-3">
              Resurslar & Karyera
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link href="/ish" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Bo'sh ish o'rinlari</Link></li>
              <li><Link href="/resurslar" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Bepul Resurslar Hubi</Link></li>
              <li><Link href="/atamalar" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">AI Atamalar Lug'ati</Link></li>
              <li><Link href="/ekspertlar" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Bitiruvchi Ekspertlar</Link></li>
              <li><Link href="/meetlar" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Jonli Meetlar</Link></li>
            </ul>
          </div>

          {/* Col 4: Kabinet & Huquqiy */}
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-ink)] mb-3">
              Talaba Kabineti
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link href="/kabinet" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Kabinet Boshqaruvi</Link></li>
              <li><Link href="/kabinet/to-lovlar" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">To'lovlar & Cheklar</Link></li>
              <li><Link href="/kabinet/referral" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Referral & Bonus</Link></li>
              <li><Link href="/kabinet/sozlamalar" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Profil Sozlamalari</Link></li>
              <li><Link href="/pul-qaytarish" prefetch={true} className="hover:text-[var(--color-accent)] transition-colors">Pul qaytarish kafolati</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--color-ink-subtle)]">
          <div>© {new Date().getFullYear()} academy.mirzo.uz. Barcha huquqlar himoyalangan.</div>
          <div>Toshkent, O'zbekiston · Mirzo</div>
        </div>
      </div>
    </footer>
  );
});
