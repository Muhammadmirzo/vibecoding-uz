import type { ReactNode } from "react";
import { AdminNav } from "@/features/crm/components/AdminNav";

export const metadata = {
  title: "Boshqaruv markazi | Naqsh",
  description: "Naqsh platformasi uchun CRM va boshqaruv markazi",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <AdminNav />
      <main className="min-w-0 pt-20 lg:ml-72 lg:pt-0">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
