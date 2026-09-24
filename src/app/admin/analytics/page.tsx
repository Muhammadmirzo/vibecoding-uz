import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/features/analytics/ui/AnalyticsDashboard";
import { getDbSession, ADMIN_ROLES } from "@/lib/auth/require-auth";

export const metadata = {
  title: "Platforma Analitikasi | Naqsh",
};

export default async function AdminAnalyticsPage() {
  const session = await getDbSession();
  if (!session || !ADMIN_ROLES.some((role) => role === session.role)) redirect("/admin/login");
  return (
    <div className="space-y-6">
      <AnalyticsDashboard />
    </div>
  );
}
