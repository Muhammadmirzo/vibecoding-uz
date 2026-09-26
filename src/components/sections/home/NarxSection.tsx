/**
 * Home page loom section 5 "Narx + savollar" (Wave E, slice E5), per
 * docs/redesign/awwwards/02-art-direction.md §1 row 5 (the gold fill, "the
 * offer, clear price in so'm"), §2 (night canvas, gold ONLY here for the fill
 * strand — the diamond strand and the final CTA keep theirs), §3 (Unbounded 700
 * section title at clamp(2.25rem, 6vw, 6rem), U+02BB for oʻ/gʻ) and §7 (no
 * eyebrow label, no identical 3-card grid, no invented numbers).
 * Renders inside <HomeLoom>, which supplies the bg-brand-surface canvas and the
 * sticky star; `data-lab-section="narx"` is what HomeLoomMotion targets to fill
 * the star's gold centre as this section scrolls by, and { id: "narx",
 * strand: "fill" } in HOME_LOOM_SECTIONS is what un-mutes that strand.
 *
 * The motif: the star's *fill* is the centre plate of LOGO_DIAMOND filled at
 * gold 0.85. Restated as a `FillBar` — a run of small squares that are hollow
 * (bg-brand-surface + border) until the last stretch, which is solid gold: the
 * fill arriving. Each offer's price sits under its own solid gold diamond knot,
 * the same gold-on-navy pairing LoomStar uses, which keeps this screen at gold
 * plus neutrals (§2).
 *
 * Honest copy (L14): every number is read from the single source of truth —
 * `siteConfig.courses[slug].price` / `.installment`, `siteConfig.guaranteeText`
 * / `guaranteeSummary` / `guaranteeTermsUrl` and `siteConfig.sessionFormat`.
 * The crossed-out `oldPrice` is deliberately NOT shown: in siteConfig it equals
 * `price`, so there is no discount to advertise, and an invented saving or a
 * countdown timer would be a lie. No invented cohort scarcity either — the next
 * cohort date is not shown here because it is already on the course pages.
 *
 * Disclosure: the FAQ uses native `<details>/<summary>` rather than a JS
 * accordion. It is the same accessible disclosure pattern (button-like summary,
 * `aria-expanded` handled by the browser, keyboard-operable) but the answers
 * are in the server-rendered HTML, so they stay readable with JS off and there
 * is no hydration state to drift out of sync.
 *
 * Tokens only (L6): text-on-brand-surface, border-border-onBrand,
 * bg-brand-surface, text-gold, bg-gold, border-gold. No hex, no rgb, no
 * Tailwind opacity modifier on a var() color (globals.css bakes the alpha in —
 * L25). No percentage clip-path on a non-square box (L26).
 *
 * This section also takes over the `kurs-tanlash` anchor from the deleted
 * `<Pricing>`: the site nav, the mobile drawer, the header CTA and the CRM's
 * default `headerCtaLink` all deep-link to `/#kurs-tanlash`, so the id travels
 * with the offer.
 */
import Link from "next/link";
import { COURSES } from "@/features/courses/content";
import { uzDisplay } from "@/features/lab-naqsh/domain/uzText";
import { siteConfig } from "@/lib/siteConfig";

/** The two real courses, in the order they appear in the story. */
const OFFER_SLUGS = ["vibe-coding-express", "ai-asoslari"] as const;

const OFFER_COPY: Record<(typeof OFFER_SLUGS)[number], string> = {
  "vibe-coding-express":
    "8 haftalik amaliy guruh kursi — kod yozishni bilmasangiz ham, oʻz gʻoyangizni ishlaydigan mahsulotga aylantirasiz.",
  "ai-asoslari":
    "4 haftalik mustaqil kurs — AI vositalarini kundalik ish va kontent uchun noldan oʻrganish.",
};

/**
 * The fill strand: squares stay hollow until the last stretch, which fills in
 * gold. Purely decorative (aria-hidden), and it is the only place a gold
 * *block* appears, so it reads as the star's centre plate filling.
 */
function FillBar() {
  return (
    <span aria-hidden="true" className="mt-10 flex flex-wrap items-center gap-1.5 sm:mt-14 sm:gap-2">
      {Array.from({ length: 24 }, (_, index) => {
        const filled = index >= 16;
        return (
          <span
            key={index}
            className={
              filled
                ? "block size-3 shrink-0 bg-gold sm:size-4"
                : "block size-3 shrink-0 border border-border-onBrand sm:size-4"
            }
          />
        );
      })}
    </span>
  );
}

/** Solid gold diamond — the same knot the star's filled centre implies. */
function GoldKnot() {
  return <span aria-hidden="true" className="block size-2.5 shrink-0 rotate-45 bg-gold" />;
}

export function NarxSection() {
  const faqs = [
    {
      question: "Dasturlashni bilasam kerakmi?",
      answer: `Yoʻq. Kurs noldan boshlanadi: birinchi haftadanoq AI yordamida kod yozishni va tushunishni oʻrgatamiz. ${COURSES["vibe-coding-express"].level}. AI Asoslari kursi esa mutlaqo boshlangʻich daraja uchun.`,
    },
    {
      question: "Darslar qanday oʻtadi?",
      answer: `${siteConfig.sessionFormat}. Jonli sessiyalar yozib olinadi va shaxsiy kabinetingizda saqlanadi. AI Asoslari mustaqil video darslar va amaliy topshiriqlardan iborat.`,
    },
    {
      question: "Kurs qaysi tilda?",
      answer:
        "Darslar, topshiriqlar va izohlar oʻzbek tilida beriladi. Texnik atamalar kerak boʻlganda tushuntiriladi.",
    },
    {
      question: "Toʻlovni boʻlib toʻlasam boʻladimi?",
      answer: `Ha. Vibe Coding Express uchun ${siteConfig.courses["vibe-coding-express"].installment}, AI Asoslari uchun ${siteConfig.courses["ai-asoslari"].installment} toʻlov rejasidan foydalanishingiz mumkin.`,
    },
  ];

  return (
    <section
      id="kurs-tanlash"
      data-lab-section="narx"
      aria-labelledby="narx-title"
      // `kurs-tanlash` is the anchor the site nav points at ("Kurslar" in the
      // desktop nav, the mobile drawer and the header CTA, plus the CRM's
      // default headerCtaLink) — it used to live on the old <Pricing> section,
      // so this section inherits it or that link would dead-end. scroll-mt-24
      // is the same offset the other anchored pages use, so the sticky header
      // does not cover the heading.
      className="relative flex min-h-[100vh] scroll-mt-24 flex-col justify-center py-24 sm:min-h-[110vh]"
    >
      <h2
        id="narx-title"
        className="max-w-3xl text-balance font-display font-bold leading-[0.95] tracking-[-0.045em] text-on-brand-surface"
        style={{ fontSize: "clamp(2.25rem, 6vw, 6rem)" }}
      >
        Narx — aniq va oddiy.
      </h2>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-brand-surface opacity-80">
        Ikkala kurs ham bitta toʻlov bilan. Narx pastda, aynan shunday yozilgan
        qanday boʻlsa — chegirma yoʻq, muddat yoʻq. Toʻlovni boʻlib toʻlash
        mumkin, summa esa oʻz oʻzidan aniq.
      </p>

      <FillBar />

      {/* The offer: two real courses as a vertical run, like the rest of the
          loom sections. NOT a 2-up grid — measured in the page, the 7/12
          content column is only 246 px at 1024 px (the loom takes 5 columns),
          so a 2-up split squeezed the price figure until it overflowed its
          column by 77 px. One offer per row gives the figure the whole column
          at every breakpoint (L24: measured, not eyeballed). */}
      <div className="mt-12 sm:mt-16">
        {OFFER_SLUGS.map((slug) => {
          const course = COURSES[slug];
          const price = siteConfig.courses[slug];
          return (
            <article key={slug} className="border-t-2 border-gold py-10 first:border-t-0 first:pt-0">
              <h3 className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-on-brand-surface sm:text-3xl">
                {course.title}
              </h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-on-brand-surface opacity-75">
                {uzDisplay(OFFER_COPY[slug])}
              </p>

              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-on-brand-surface opacity-60">
                    Davomiyligi
                  </dt>
                  <dd className="text-on-brand-surface">{uzDisplay(course.duration)}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-on-brand-surface opacity-60">
                    Format
                  </dt>
                  <dd className="text-on-brand-surface">{uzDisplay(course.format)}</dd>
                </div>
              </dl>

              {/* The price, under the gold knot. Stepped per breakpoint, not
                  clamped on vw: the content column is 291 px at 375 but 512 px
                  already at 640 (the loom column only appears at lg), so a vw
                  clamp under-sizes the figure on tablet. Each step is measured
                  to fit its column — see the data-price-fit assertion (L24). */}
              <div data-price-fit className="mt-8 flex items-center gap-3">
                <GoldKnot />
                <p className="whitespace-nowrap font-display text-2xl font-bold leading-none tracking-[-0.03em] text-gold sm:text-4xl lg:text-5xl">
                  {uzDisplay(price.price)}
                </p>
              </div>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-on-brand-surface opacity-70">
                Bir marta toʻlov. Boʻlib toʻlash: {uzDisplay(price.installment)}.
              </p>

              <Link
                href={`/kurs/${slug}`}
                className="link-underline mt-8 inline-flex min-h-11 items-center gap-2 self-start font-semibold text-gold decoration-1 underline-offset-4 hover:underline"
              >
                {course.title} kursi haqida
                <span className="sr-only"> — sahifani ochish</span>
              </Link>
            </article>
          );
        })}
      </div>

      {/* the guarantee: the one place a gold frame states a promise */}
      <aside className="mt-14 border border-gold p-6 sm:mt-16 sm:p-8">
        <div className="flex items-center gap-3">
          <GoldKnot />
          <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-gold sm:text-2xl">
            {uzDisplay(siteConfig.guaranteeText)}
          </h3>
        </div>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-on-brand-surface opacity-80">
          {uzDisplay(siteConfig.guaranteeSummary)}
        </p>
        <p className="mt-4 text-base leading-relaxed">
          <Link
            href={siteConfig.guaranteeTermsUrl}
            className="link-underline mt-2 inline-flex min-h-11 items-center font-semibold text-gold decoration-1 underline-offset-4 hover:underline"
          >
            Shartlarni oʻqib chiqing
            <span className="sr-only"> — pul qaytarish kafolati shartlari sahifasi</span>
          </Link>
        </p>
      </aside>

      {/* FAQ: prerequisite, format, language, payment — the things people ask
          before they pay, answered in full, no sales tone */}
      <div className="mt-16 sm:mt-20">
        <h3 className="font-display text-2xl font-bold tracking-[-0.02em] text-on-brand-surface sm:text-3xl">
          Savollar
        </h3>
        <ul className="mt-6 border-t border-border-onBrand">
          {faqs.map((faq) => (
            <li key={faq.question} className="border-b border-border-onBrand">
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-on-brand-surface [&::-webkit-details-marker]:hidden">
                  {uzDisplay(faq.question)}
                  <span
                    aria-hidden="true"
                    className="shrink-0 rotate-45 border border-gold p-1 transition-transform duration-200 group-open:rotate-[135deg]"
                  />
                </summary>
                <p className="max-w-2xl pb-6 text-base leading-relaxed text-on-brand-surface opacity-80">
                  {uzDisplay(faq.answer)}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
