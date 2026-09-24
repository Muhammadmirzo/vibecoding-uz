import type { Metadata } from "next";
import { ServicesPageContent } from "@/features/services/ServicesPageContent";

export const metadata: Metadata = {
  title: "Xizmatlar — AI, Telegram bot va MVP | Naqsh",
  description: "AI avtomatlashtirish, Telegram bot va MVP qurish xizmatlari. Boshlang'ich narx va aniq taklif.",
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
