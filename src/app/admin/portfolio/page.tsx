import { Metadata } from "next";
import { PortfolioManager } from "@/features/crm/components/PortfolioManager";

export const metadata: Metadata = {
  title: "Portfolio Boshqaruvi — Admin Console",
  description: "Vibe Coding platformasi portfoliosini boshqarish",
};

export default function AdminPortfolioPage() {
  return <PortfolioManager />;
}
