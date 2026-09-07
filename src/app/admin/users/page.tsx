import { UserManager } from "@/features/crm/components/UserManager";

export const metadata = {
  title: "Foydalanuvchilar & Audit | Vibecoding Admin",
  description: "Xodimlar rollari va tizim audit jurnali paneli",
};

export default function AdminUsersPage() {
  return <UserManager />;
}
