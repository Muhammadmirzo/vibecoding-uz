import { ReactNode } from "react";
import { AdminNav } from "@/features/crm/components/AdminNav";

export const metadata = {
  title: "Admin Panel & CRM | Mirzo Academy Platform",
  description: "Mirzo Academy platformasi admin va CRM boshqaruv paneli",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col font-sans">
      <AdminNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
