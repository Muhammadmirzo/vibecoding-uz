import type { Metadata } from "next";
import { TestimonialsExplorer } from "./TestimonialsExplorer";

export const metadata: Metadata = {
  title: "Kurs bo‘yicha namunaviy fikrlar | Mirzo Academy",
  description:
    "Mirzo Academy kurslari bo‘yicha namunaviy fikrlar. Haqiqiy bitiruvchi natijalari faqat rozigi bilan e’lon qilinadi.",
};

export default function TestimoniyalarPage() {
  return <TestimonialsExplorer />;
}
