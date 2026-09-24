import type { Metadata } from "next";
import { PortfolioGallery } from "./PortfolioGallery";

export const metadata: Metadata = {
  title: "Portfolio — Vibe Coding loyihalari | Naqsh",
  description:
    "Sun'iy intellekt yordamida qurilgan jonli loyihalar va ularning ochiq raqamlarini ko'rib chiqing.",
};

export default function PortfolioPage() {
  return <PortfolioGallery />;
}
