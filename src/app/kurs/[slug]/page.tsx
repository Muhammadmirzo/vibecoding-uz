import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Check, Clock, User, X } from "lucide-react";
import { FaqDisclosure } from "@/components/ui/FaqDisclosure";
import { Badge } from "@/components/ui/Surfaces";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surfaces";
import { Container, Eyebrow, Heading, Section } from "@/components/ui/Layout";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { PageHero } from "@/components/pages/PageHero";
import { CohortCountdown } from "@/components/pages/CohortCountdown";
import { Reveal, RevealGroup } from "@/features/motion/ui/Reveal";
import { ScrollFillText } from "@/features/motion/ui/ScrollFillText";
import { getPublicPortfolios } from "@/features/portfolio/server/portfolio.service";
import { siteConfig } from "@/lib/siteConfig";
import { courseJsonLd, routeMetadata, serializeJsonLd } from "@/lib/seo";
import { COMPARISON_ROWS, COURSES, COURSE_SLUGS, getCoursePricing } from "@/features/courses/content";
import { CourseCheckoutCard } from "../CourseCheckoutCard";
import { StickyBuyBar } from "./StickyBuyBar";
import { ScrollProgress } from "@/features/motion/ui/ScrollProgress";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return COURSE_SLUGS.map((slug) => ({ slug }));
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = COURSES[slug];
  if (!course) return { title: "Kurs topilmadi" };
  return routeMetadata({ title: `${course.title} — ${course.subtitle}`, description: course.description, path: `/kurs/${slug}` });
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = COURSES[slug];
  if (!course) notFound();
  const pricing = getCoursePricing(slug);
  const projects = (await getPublicPortfolios()).portfolios.slice(0, 3);

  const jsonLd = courseJsonLd({ name: course.title, description: course.description, price: pricing.price, path: `/kurs/${slug}`, startDate: siteConfig.nextCohortDate });

  return (
    <div className="bg-bg">
      <ScrollProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <PageHero
        eyebrow={course.level}
        title={course.title}
        lede={<><span className="font-semibold text-ink">{course.subtitle}.</span> {course.description}</>}
        meta={
          <div className="w6c-load mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs" style={{ "--i": 2 } as React.CSSProperties}>
            <Badge>{course.level}</Badge>
            <span className="inline-flex items-center gap-1.5 text-ink-muted">
              <Clock className="size-4 text-accent" aria-hidden="true" /> {course.duration}
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-muted">
              <Calendar className="size-4 text-accent" aria-hidden="true" /> Keyingi guruh: {siteConfig.nextCohortShortDate}
            </span>
          </div>
        }
        actions={<><Button href="/diagnostika" size="lg">Mosligini tekshirish</Button><Button href="/bepul-dars" size="lg" variant="outline">Avval bepul dars</Button></>}
        aside={
          <div className="w6c-load lg:sticky lg:top-24" style={{ "--i": 3 } as React.CSSProperties}>
            <div className="mb-3 min-h-[46px]">
              <CohortCountdown date={siteConfig.nextCohortDate} />
            </div>
            <CourseCheckoutCard
              courseSlug={slug}
              price={pricing.price}
              oldPrice={pricing.oldPrice}
              installment={pricing.installment}
              sessionFormat={course.format}
              guaranteeText={siteConfig.guaranteeText}
            />
          </div>
        }
      >
        <Card className="card-glow mt-10 max-w-2xl space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink">Kurs oxirida qo&apos;lingizda bo&apos;ladi</h2>
          <ul className="space-y-2.5">
            {course.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3 text-sm text-ink">
                <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" /> {outcome}
              </li>
            ))}
          </ul>
        </Card>
      </PageHero>

      <Section pattern={false} className="w6c-wipe bg-bg-sunken">
        <RevealGroup className="grid gap-6 md:grid-cols-2">
          <Card className="card-glow space-y-4">
            <Eyebrow>Kim uchun</Eyebrow>
            <Heading className="text-2xl">Bu kurs sizga mos, agar...</Heading>
            <ul className="space-y-3">
              {course.forWhom.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink">
                  <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-4">
            <Eyebrow>Halol ogohlantirish</Eyebrow>
            <Heading className="text-2xl">Kimga mos emas</Heading>
            <ul className="space-y-3">
              {course.notForWhom.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
                  <X className="mt-0.5 size-5 shrink-0 text-ink-subtle" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </Card>
        </RevealGroup>
      </Section>

      <Section eyebrow="Bosqichma-bosqich reja" title="Haftalik yo'l xaritasi" subtitle="Har hafta — bitta ishlaydigan natija. Yo'l skroll bilan chiziladi.">
        <p className="mt-6 max-w-3xl font-display text-xl font-medium leading-snug sm:text-2xl">
          <ScrollFillText text="Reja qog'ozda qolmaydi: har yakshanba qo'lingizda ko'rinadigan natija bo'ladi." />
        </p>
        <div className="w6c-path mt-10">
          <div className="w6c-path-rail" aria-hidden="true"><div className="w6c-path-progress" /></div>
          <ol className="space-y-5">
            {course.roadmap.map((week) => (
              <li key={week.week} className="w6c-step">
                <span className="w6c-step-dot" aria-hidden="true" />
                <div className="w6c-step-card md:grid md:grid-cols-[112px_minmax(0,1fr)_minmax(180px,240px)] md:items-start md:gap-6">
                  <p className="font-mono text-xs font-semibold text-brand">{week.week}</p>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{week.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{week.outcome}</p>
                  </div>
                  <p className="mt-2 inline-block rounded-md bg-brand-soft px-3 py-1 text-xs font-semibold text-brand md:mt-0 md:justify-self-end md:text-right">
                    Amaliy natija: {week.project}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section pattern={false} className="w6c-wipe bg-bg-sunken" eyebrow="Real loyihalar" title="Shu metod bilan qurilgan ishlar">
        <RevealGroup className="mt-8 grid gap-5 md:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="card-glow flex flex-col gap-3">
              <Badge variant="gold">{project.badgeText}</Badge>
              <h3 className="font-display text-lg font-semibold text-ink">{project.title}</h3>
              <p className="text-sm text-ink-muted">{project.description}</p>
              <p className="mt-auto font-mono text-xs text-ink-subtle">{project.domain}</p>
            </Card>
          ))}
        </RevealGroup>
        <Reveal><Button href="/portfolio" variant="outline" className="mt-8">Barcha loyihalarni ko&apos;rish</Button></Reveal>
      </Section>

      <Section eyebrow="Mentor" title="Kimdan o'rganasiz?">
        <Reveal>
          <Card className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand" aria-hidden="true">
              <User className="size-7" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-ink">Mirzo</p>
              <p className="mt-1 text-sm text-ink-muted">
                EduBaza va Chatla loyihalari muallifi, vibe coding mentori. Har bir
                vazifangizni shaxsan tekshiradi va yo&apos;nalish beradi.
              </p>
            </div>
          </Card>
        </Reveal>
        <Reveal>
          <h3 className="mb-4 mt-12 font-display text-xl font-semibold text-ink">Qaysi yo&apos;l sizga to&apos;g&apos;ri keladi?</h3>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[560px] border-collapse bg-bg-elevated text-left text-sm">
              <caption className="sr-only">Naqsh, an&apos;anaviy bootcamp va YouTube solishtiruvi</caption>
              <thead>
                <tr className="border-b border-border bg-bg-sunken">
                  <th scope="col" className="px-5 py-4 font-semibold text-ink">Mezon</th>
                  <th scope="col" className="px-5 py-4 font-semibold text-brand">Naqsh</th>
                  <th scope="col" className="px-5 py-4 font-semibold text-ink-muted">An&apos;anaviy bootcamp</th>
                  <th scope="col" className="px-5 py-4 font-semibold text-ink-muted">YouTube</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <th scope="row" className="px-5 py-3.5 font-semibold text-ink">{row.label}</th>
                    <td className="px-5 py-3.5 text-ink">{row.vibe}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{row.bootcamp}</td>
                    <td className="px-5 py-3.5 text-ink-muted">{row.youtube}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      <Section pattern={false} className="bg-bg-sunken" eyebrow="Savol-javob" title="Ko'p so'raladigan savollar">
        <FaqDisclosure items={course.faqs} />
      </Section>

      <NextStepCTA
        title="Hali ikkilanayapsizmi?"
        subtitle="Avval 2 daqiqalik diagnostikadan o'ting yoki bepul darsni ko'ring — keyin qaror qiling."
      />
      <StickyBuyBar price={pricing.price} title={course.title} courseSlug={slug} />
      <div className="h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />
    </div>
  );
}
