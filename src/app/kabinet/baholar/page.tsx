import type { Metadata } from "next";
import { Award } from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { KabinetPageHeader, KabinetState } from "@/features/lms/components/KabinetPage";

export const metadata: Metadata = {
  title: "Baholar | Naqsh",
  description: "Talabaning topshiriqlari va mentor baholari.",
};

export default function BaholarPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <KabinetNav />
      <main className="mx-auto w-full max-w-5xl space-y-8 px-5 pb-28 pt-24 md:px-8 md:pt-28 lg:pl-80 lg:pr-8">
        <KabinetPageHeader title="Baholar va reyting" description="Faol topshiriqlar va mentor baholari tizimga saqlanganida shu yerda ko&apos;rinadi." icon={Award} />
        <KabinetState title="Hozircha baholar yo&apos;qi" description="Bu sahifada o&apos;quvchining reytingi yoki mentor bahosi saqlanmagan. Kurs topshiriqlarini bajarib topshiring." />
      </main>
    </div>
  );
}
