/**
 * Home page loom section 4 "Natijalar" (Wave E, slice E4), per
 * docs/redesign/awwwards/02-art-direction.md §1 row 4 (the outer tessellation,
 * "**real** student projects only"), §2 (night canvas, at most 2 colors plus
 * neutrals), §3 (Unbounded 700 at clamp(2.25rem, 6vw, 6rem), U+02BB for oʻ/gʻ)
 * and §7 (no identical 3-card grid, no eyebrow label, no invented numbers).
 * Renders inside <HomeLoom>, which supplies the bg-brand-surface canvas and the
 * sticky star; `data-lab-section="natijalar"` is what HomeLoomMotion targets to
 * scrub the star's ring strand as this section scrolls by.
 *
 * The ring: an 8-sided figure, the same geometry as the girih star's outer ring
 * (LoomStar draws it as a dashed circle on `data-strand="ring"`). The octagons
 * are real `clip-path` polygons over a 1px clipped border — a two-layer clip,
 * so the frame is geometry rather than eight hand-placed border segments. They
 * only ever sit on **square** boxes: a percentage polygon on a wide, short box
 * cuts the corners at wildly different depths and eats the text in them. So the
 * project frame is a square medallion beside the copy, and the wide band above
 * the list is a tessellated run of small octagons that alternate solid/hollow —
 * the over-under alternation of the weave strand, restated as an outer ring.
 * One accent-coloured dashed octagon per project echoes the star's own ring;
 * everything else is a neutral border token, keeping this screen at 2 colors
 * plus neutrals (§2).
 *
 * Data honesty (L14): the list is the static VERIFIED_PORTFOLIO_FALLBACK — only
 * entries the owner verified as `ownership: "owner"` + `status: "published"`.
 * Nothing is invented: no testimonials, no follower counts, no student names. A
 * project's own `userCount` is only ever shown together with its `note` (the
 * site's public claim, not an independent audit), and the fallback currently has
 * none, so this section renders no numbers at all.
 *
 * Tokens only (L6): text-on-brand-surface, border-border-onBrand,
 * bg-brand-surface, accent (SVG stroke, as in LoomStar). No gold here — §2 gives
 * gold to the diamond strand, the finished star and the primary CTA only.
 */
import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { VERIFIED_PORTFOLIO_FALLBACK } from "@/features/portfolio/portfolioData";

/** Cut-corner square = regular octagon. Underscores are Tailwind's for spaces. */
const OCTAGON =
  "[clip-path:polygon(28%_0,72%_0,100%_28%,100%_72%,72%_100%,28%_100%,0_72%,0_28%)]";

/** Hollow or solid tile of the tessellation run, alternating over/under. */
function Tessera({ solid }: { solid: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block size-3 shrink-0 sm:size-4",
        solid ? "bg-on-brand-surface" : "border border-on-brand-surface"
      )}
    />
  );
}

export function NatijalarSection() {
  const projects = VERIFIED_PORTFOLIO_FALLBACK;

  return (
    <section
      data-lab-section="natijalar"
      aria-labelledby="natijalar-title"
      className="relative flex min-h-[100vh] flex-col justify-center py-24 sm:min-h-[110vh]"
    >
      <h2
        id="natijalar-title"
        className="max-w-3xl text-balance font-display font-bold leading-[0.95] tracking-[-0.045em] text-on-brand-surface"
        style={{ fontSize: "clamp(2.25rem, 6vw, 6rem)" }}
      >
        Sertifikat emas, ochiladigan mahsulotlar.
      </h2>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-brand-surface opacity-80">
        Quyidagi loyihalar shu metod boʻyicha qurilgan va hozir jonli ishlaydi.
        Har bir havolani ochib, ishlayotganini oʻzingiz koʻrib chiqing.
      </p>

      {/* the outer tessellation: a run of octagonal tesserae closing the star */}
      <div aria-hidden="true" className="mt-12 flex flex-wrap items-center gap-1.5 opacity-70 sm:mt-16 sm:gap-2">
        {Array.from({ length: 26 }, (_, index) => (
          <Tessera key={index} solid={index % 2 === 0} />
        ))}
      </div>

      <ol className="mt-10 sm:mt-12">
        {projects.map((project, index) => (
          <li
            key={project.id}
            className="border-t border-border-onBrand py-10 first:border-t-0 first:pt-0"
          >
            <article className="grid gap-6 sm:grid-cols-[9rem_1fr] sm:items-start sm:gap-8">
              {/* the ring frame: a square octagonal medallion, so the percentage
                  polygon stays regular; a dashed accent octagon inside it echoes
                  the star's own ring strand */}
              <div aria-hidden="true" className="relative size-24 shrink-0 sm:size-36">
                <div className={cn("h-full w-full p-px bg-border-onBrand", OCTAGON)}>
                  <div className={cn("flex h-full w-full items-center justify-center bg-brand-surface", OCTAGON)}>
                    <svg viewBox="0 0 32 32" width="55%" height="55%" fill="none" focusable="false">
                      <polygon
                        points="9,1 23,1 31,9 31,23 23,31 9,31 1,23 1,9"
                        stroke="var(--accent)"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                    </svg>
                  </div>
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] tracking-[0.2em] text-on-brand-surface opacity-60">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-on-brand-surface opacity-70">
                  {project.category}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-on-brand-surface sm:text-3xl">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline decoration-1 underline-offset-4 hover:underline"
                  >
                    {project.title}
                    <span className="sr-only">
                      {" "}
                      — jonli saytni yangi oynada ochish ({project.domain})
                    </span>
                  </a>
                </h3>
                <p className="mt-3 max-w-lg text-base leading-relaxed text-on-brand-surface opacity-75">
                  {project.description}
                </p>
                <p className="mt-4 font-mono text-xs tracking-[0.06em] text-on-brand-surface opacity-60">
                  {project.domain}
                </p>

                {/* L14: a figure is only ever shown with its own source caveat. */}
                {project.userCount ? (
                  <p className="mt-3 text-sm leading-relaxed text-on-brand-surface opacity-70">
                    {project.userCount}
                    {project.note ? ` — ${project.note}` : null}
                  </p>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex max-w-2xl flex-col gap-4 sm:mt-12">
        <Link
          href="/portfolio"
          aria-label="Portfolio boʻlimini ochish — tekshirilgan loyihalar toʻliq roʻyxati"
          className="link-underline inline-flex min-h-11 items-center gap-2 self-start font-semibold text-on-brand-surface decoration-1 underline-offset-4 hover:underline"
        >
          Barcha loyihalarni koʻrish
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
        <p className="flex items-start gap-2 text-sm leading-relaxed text-on-brand-surface opacity-60">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Roʻyxat faqat egasi tasdiqlagan, ochiq va jonli loyihalarni koʻrsatadi. Agar
            loyiha oʻz raqamini nashr etsa, u faqat oʻsha saytning ochiq maʼlumoti sifatida
            koʻrsatiladi — mustaqil audit qilinmagan.
          </span>
        </p>
      </div>
    </section>
  );
}
