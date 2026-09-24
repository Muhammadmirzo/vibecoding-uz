import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Check, Clock, User, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Surfaces";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surfaces";
import { Container, Eyebrow, Heading, Section } from "@/components/ui/Layout";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { PORTFOLIO_DATA } from "@/features/portfolio/portfolioData";
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
  const projects = PORTFOLIO_DATA.filter((item) => item.isFeatured).slice(0, 3);

  const jsonLd = courseJsonLd({ name: course.title, description: course.description, price: pricing.price, path: `/kurs/${slug}`, startDate: siteConfig.nextCohortDate });

  return (
    <div className="bg-bg">
      <ScrollProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <Section eyebrow={course.level} title="">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <Badge>{course.level}</Badge>
              <span className="inline-flex items-center gap-1.5 text-ink-muted">
                <Clock className="size-4 text-accent" aria-hidden="true" /> {course.duration}
              </span>
              <span className="inline-flex items-center gap-1.5 text-ink-muted">
                <Calendar className="size-4 text-accent" aria-hidden="true" /> Keyingi guruh: {siteConfig.nextCohortShortDate}
              </span>
            </div>
            <Heading as="h1" className="text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)]">
              {course.title}
            </Heading>
            <p className="text-lg text-ink-muted">{course.subtitle}</p>
            <p className="text-ink-muted">{course.description}</p>
            <Card className="space-y-3">
              <h2 className="font-display text-lg font-semibold text-ink">Kurs oxirida qo'lingizda bo'ladi</h2>
              <ul className="space-y-2.5">
                {course.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-3 text-sm text-ink">
                    <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" /> {outcome}
                  </li>
                ))}
              </ul>
            </Card>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/diagnostika" size="lg">Mosligini tekshirish</Button>
              <Button href="/bepul-dars" size="lg" variant="outline">Avval bepul dars</Button>
            </div>
          </div>
          <CourseCheckoutCard
            price={pricing.price}
            oldPrice={pricing.oldPrice}
            installment={pricing.installment}
            sessionFormat={course.format}
            guaranteeText={siteConfig.guaranteeText}
          />
        </div>
      </Section>

      <Section pattern={false} className="bg-bg-sunken">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="space-y-4">
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
        </div>
      </Section>

      <Section eyebrow="Bosqichma-bosqich reja" title="Haftalik yo'l xaritasi">
        <ol className="relative mt-10 space-y-0 border-l-2 border-brand/20">
          {course.roadmap.map((week) => (
            <li key={week.week} className="relative pb-7 pl-8 last:pb-0 md:grid md:grid-cols-[112px_minmax(0,1fr)_minmax(180px,240px)] md:items-start md:gap-6 md:pb-6">
              <span className="absolute -left-[9px] top-1 size-4 rounded-full border-2 border-brand bg-bg" aria-hidden="true" />
              <p className="font-mono text-xs font-semibold text-brand">{week.week}</p>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">{week.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{week.outcome}</p>
              </div>
              <p className="mt-2 inline-block rounded-md bg-brand-soft px-3 py-1 text-xs font-semibold text-brand md:mt-0 md:justify-self-end md:text-right">
                Amaliy natija: {week.project}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section pattern={false} className="bg-bg-sunken" eyebrow="Real loyihalar" title="Shu metod bilan qurilgan ishlar">
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col gap-3">
              <Badge variant="gold">{project.badgeText}</Badge>
              <h3 className="font-display text-lg font-semibold text-ink">{project.title}</h3>
              <p className="text-sm text-ink-muted">{project.description}</p>
              <p className="mt-auto font-mono text-xs text-ink-subtle">{project.domain}</p>
            </Card>
          ))}
        </div>
        <Button href="/portfolio" variant="outline" className="mt-8">Barcha loyihalarni ko'rish</Button>
      </Section>

      <Section eyebrow="Mentor" title="Kimdan o'rganasiz?">
        <Card className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand" aria-hidden="true">
            <User className="size-7" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-ink">Mirzo</p>
            <p className="mt-1 text-sm text-ink-muted">
              EduBaza va Chatla loyihalari muallifi, vibe coding mentori. Har bir
              vazifangizni shaxsan tekshiradi va yo'nalish beradi.
            </p>
          </div>
        </Card>
        <h3 className="mb-4 mt-12 font-display text-xl font-semibold text-ink">Qaysi yo&apos;l sizga to&apos;g&apos;ri keladi?</h3>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] border-collapse bg-bg-elevated text-left text-sm">
            <caption className="sr-only">Naqsh, an&apos;anaviy bootcamp va YouTube solishtiruvi</caption>
            <thead>
              <tr className="border-b border-border bg-bg-sunken">
                <th scope="col" className="px-5 py-4 font-semibold text-ink">Mezon</th>
                <th scope="col" className="px-5 py-4 font-semibold text-brand">Naqsh</th>
                <th scope="col" className="px-5 py-4 font-semibold text-ink-muted">An'anaviy bootcamp</th>
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
      </Section>

      <Section pattern={false} className="bg-bg-sunken" eyebrow="Savol-javob" title="Ko'p so'raladigan savollar">
        <Accordion type="single" collapsible className="mx-auto mt-8 max-w-3xl rounded-xl border border-border bg-bg-elevated px-6">
          {course.faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <NextStepCTA
        title="Hali ikkilanayapsizmi?"
        subtitle="Avval 2 daqiqalik diagnostikadan o'ting yoki bepul darsni ko'ring — keyin qaror qiling."
      />
      <StickyBuyBar price={pricing.price} title={course.title} />
      <div className="h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />
    </div>
  );
}
