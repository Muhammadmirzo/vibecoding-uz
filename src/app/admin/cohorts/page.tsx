import { CohortManager } from "@/features/crm/components/CohortManager";

export const metadata = {
  title: "Guruhlar va Qabul | Vibecoding Admin",
};

export default function AdminCohortsPage() {
  return (
    <div className="space-y-6">
      <CohortManager />
    </div>
  );
}
