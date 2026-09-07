import { NotificationManager } from "@/features/crm/components/NotificationManager";

export const metadata = {
  title: "Xabarnomalar | Vibecoding Admin",
  description: "Telegram bot, email va SMS orqali bildirishnomalar yuborish paneli",
};

export default function AdminNotificationsPage() {
  return <NotificationManager />;
}
