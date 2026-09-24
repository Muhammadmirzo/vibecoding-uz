import { AnalyticsDashboard } from "@/features/crm/components/AnalyticsDashboard";

export const metadata = {
  title: "Platforma Analitikasi | Naqsh",
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AnalyticsDashboard />
    </div>
  );
}
