import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/home/HeroSection";
import { ToolStrip } from "@/components/sections/home/ToolStrip";
import { ProblemShift } from "@/components/sections/home/ProblemShift";
import { Transformation } from "@/components/sections/home/Transformation";
import { Roadmap } from "@/components/sections/home/Roadmap";
import { Projects } from "@/components/sections/home/Projects";
import { Mentor } from "@/components/sections/home/Mentor";
import { Pricing } from "@/components/sections/home/Pricing";
import { Comparison } from "@/components/sections/home/Comparison";
import { Faq } from "@/components/sections/home/Faq";
import { NextStepCTA } from "@/components/ui";
import { siteConfig } from "@/lib/siteConfig";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://academy.mirzo.uz";
const title = "G'oyangizni AI bilan ishlaydigan ilovaga aylantiring";
const description = "Kod yozishni bilmasangiz ham, AI va Claude Code yordamida 8 haftada g'oyangizni ishlaydigan ilovaga aylantiring.";

export const metadata: Metadata = { title, description, alternates: { canonical: "/" }, openGraph: { title, description, url: "/", siteName: "VibeCoding.uz", locale: "uz_UZ", type: "website" } };

const organization = { "@context": "https://schema.org", "@type": "Organization", name: "VibeCoding.uz", url: siteUrl, description };
const courseList = { "@context": "https://schema.org", "@type": "ItemList", itemListElement: Object.keys(siteConfig.courses).map((slug, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "Course", name: slug === "ai-asoslari" ? "AI Asoslari" : "Vibe Coding Express", description: slug === "ai-asoslari" ? "AI vositalarini amaliy qo'llash kursi" : "AI bilan ishlaydigan ilova qurish kursi", url: `${siteUrl}/kurs/${slug}`, provider: { "@id": `${siteUrl}/#organization` } } })) };

export default function HomePage() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([{ ...organization, "@id": `${siteUrl}/#organization` }, courseList]) }} /><HeroSection /><ToolStrip /><ProblemShift /><Transformation /><Roadmap /><Projects /><Mentor /><Pricing /><Comparison /><Faq /><NextStepCTA /></>; }
