import type { Metadata } from "next";
import "./../components/sections/home/home-motion.css";
import "./../components/sections/home/home-sections.css";
import "./../components/sections/home/home-story.css";
import { HeroSection } from "@/components/sections/home/HeroSection";
import { BuildStory } from "@/components/sections/home/BuildStory";
import { ToolStrip } from "@/components/sections/home/ToolStrip";
import { HomeLoom } from "@/components/sections/home/HomeLoom";
import { MuammoSection } from "@/components/sections/home/MuammoSection";
import { UsulSection } from "@/components/sections/home/UsulSection";
import { DasturSection } from "@/components/sections/home/DasturSection";
import { NatijalarSection } from "@/components/sections/home/NatijalarSection";
import { Mentor } from "@/components/sections/home/Mentor";
import { Pricing } from "@/components/sections/home/Pricing";
import { Comparison } from "@/components/sections/home/Comparison";
import { Faq } from "@/components/sections/home/Faq";
import { NextStepCTA } from "@/components/ui";
import { siteConfig } from "@/lib/siteConfig";
import { BRAND } from "@/config/brand";

const siteUrl = BRAND.url;
const title = "G'oyangizni AI bilan ishlaydigan ilovaga aylantiring";
const description = "Kod yozishni bilmasangiz ham, AI va Claude Code yordamida 8 haftada g'oyangizni ishlaydigan ilovaga aylantiring.";

// Root-segment page: the layout title template does not apply here, so brand it explicitly.
export const metadata: Metadata = { title: { absolute: `${title} — ${BRAND.name}` }, description, alternates: { canonical: "/" }, openGraph: { title, description, url: "/", siteName: BRAND.name, locale: BRAND.locale, type: "website" } };

const organization = { "@context": "https://schema.org", "@type": "Organization", name: BRAND.name, url: siteUrl, description };
const courseList = { "@context": "https://schema.org", "@type": "ItemList", itemListElement: Object.keys(siteConfig.courses).map((slug, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "Course", name: slug === "ai-asoslari" ? "AI Asoslari" : "Vibe Coding Express", description: slug === "ai-asoslari" ? "AI vositalarini amaliy qo'llash kursi" : "AI bilan ishlaydigan ilova qurish kursi", url: `${siteUrl}/kurs/${slug}`, provider: { "@id": `${siteUrl}/#organization` } } })) };

export default function HomePage() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([{ ...organization, "@id": `${siteUrl}/#organization` }, courseList]) }} /><HeroSection /><HomeLoom><MuammoSection /><UsulSection /><DasturSection /><NatijalarSection /></HomeLoom><BuildStory /><ToolStrip /><Mentor /><Pricing /><Comparison /><Faq /><NextStepCTA /></>; }
