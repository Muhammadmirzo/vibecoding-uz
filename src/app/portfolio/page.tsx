import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/pages/PageHero";
import { PortfolioGallery } from "./PortfolioGallery";
import { getPublicPortfolios } from "@/features/portfolio/server/portfolio.service";

export const metadata: Metadata = {
  title: "Portfolio — AI bilan qurilgan loyihalar | Naqsh",
  description: "Tekshirilgan asosiy loyihalar, talabalar va mijozlar loyihalarini ko'rib chiqing.",
};

export default async function PortfolioPage() {
  const { portfolios } = await getPublicPortfolios();
  return (
    <div className="bg-bg text-ink">
      <PageHero
        variant="dark"
        eyebrow="Portfolio · jonli loyihalar"
        title="AI yordamida qurilgan jonli loyihalar."
        lede="Har bir karta ortida ishlaydigan mahsulot turibdi — ustiga bosing va jonli manzilga o'ting."
        actions={<Button href="/xizmatlar" variant="secondary" size="lg">Xuddi shunday loyiha qurish</Button>}
      />
      <PortfolioGallery items={portfolios} />
    </div>
  );
}
