import { SettingsManager } from "@/features/crm/components/SettingsManager";

export const metadata = {
  title: "Admin Profili va Xavfsizlik | Vibecoding Admin",
  description: "Parol va login ma'lumotlarini o'zgartirish paneli",
};

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <SettingsManager />
    </div>
  );
}
