import { ServicesPageContent } from "@/features/services/ServicesPageContent";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: "Xizmatlar — AI, Telegram bot va MVP | Naqsh",
  description: "AI avtomatlashtirish, Telegram bot va MVP qurish xizmatlari. Boshlang'ich narx va aniq taklif.",
  path: "/xizmatlar",
});

export default function ServicesPage() {
  return <ServicesPageContent />;
}
