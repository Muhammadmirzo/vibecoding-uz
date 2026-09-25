import { TestimonialsExplorer } from "./TestimonialsExplorer";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: "Kurs bo‘yicha namunaviy fikrlar | Naqsh",
  description:
    "Naqsh kurslari bo‘yicha namunaviy fikrlar. Haqiqiy bitiruvchi natijalari faqat rozigi bilan e’lon qilinadi.",
  path: "/testimoniyalar",
});

export default function TestimoniyalarPage() {
  return <TestimonialsExplorer />;
}
