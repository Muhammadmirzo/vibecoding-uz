import type { Metadata } from "next";
import { Clock, CalendarDays, Wallet } from "lucide-react";
import { PageHero } from "@/components/pages/PageHero";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { Container } from "@/components/ui/Layout";
import { Badge, Card } from "@/components/ui/Surfaces";
import { Button } from "@/components/ui/Button";
import { RevealGroup } from "@/features/motion/ui/Reveal";
import { COURSES, COURSE_SLUGS, getCoursePricing } from "@/features/courses/content";
import { routeMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = routeMetadata({
  title: "Kurslar — narxi, muddati va natijasi",
  description:
    "Naqsh kurslari: narx, muddat va siz oladigan natija. Vibe Coding Express va AI Asoslari — batafsil ma'lumot shu yerda.",
  path: "/kurs",
});

/** Index card: title, one honest outcome, duration, price and a deep link. */
function CourseIndexCard({ slug }: { slug: string }) {
  const course = COURSES[slug];
  const pricing = getCoursePricing(slug);
  if (!course) return null;

  return (
    <Card className="spotlight card-glow flex h-full flex-col p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="gold">{course.duration}</Badge>
        <Badge>{course.level}</Badge>
      </div>
      <h2 className="mt-4 text-balance font-display text-2xl font-semibold text-ink">
        {course.title}
      </h2>
      <p className="mt-2 text-ink-muted">{course.subtitle}</p>
      <p className="mt-4 flex-1 text-ink-muted">{course.outcomes[0]}</p>

      <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
        <div className="flex items-center gap-2">
          <Wallet className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <dt className="sr-only">Narxi</dt>
          <dd className="font-semibold text-ink">{pricing.price}</dd>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <CalendarDays className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <dt className="sr-only">Bo&apos;lib to&apos;lash</dt>
          <dd>{pricing.installment}</dd>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <Clock className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <dt className="sr-only">Keyingi guruh</dt>
          <dd>Keyingi guruh: {siteConfig.nextCohortShortDate}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button href={`/kurs/${slug}`} size="lg">Kursni ko&apos;rish</Button>
        <Button href="/diagnostika" size="lg" variant="outline">Mosligini tekshirish</Button>
      </div>
    </Card>
  );
}

export default function KursIndexPage() {
  return (
    <div className="bg-bg text-ink">
      <PageHero
        variant="compact"
        eyebrow="Kurslar"
        title="Ikkala kurs, aniq narx bilan"
        lede={`Har biri uchun nimani o'rganish, qancha vaqt va qancha pul kerakligi shu sahifada yozilgan. ${siteConfig.guaranteeText}.`}
      />
      <Container className="pb-20 sm:pb-28">
        <RevealGroup className="grid gap-6 md:grid-cols-2">
          {COURSE_SLUGS.map((slug) => (
            <CourseIndexCard key={slug} slug={slug} />
          ))}
        </RevealGroup>
      </Container>
      <NextStepCTA
        title="Qaysi kurs sizga mos?"
        subtitle="2 daqiqalik bepul diagnostika sizga individual yo'nalishni ko'rsatadi."
      />
    </div>
  );
}
