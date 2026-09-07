import { LeadsKanban } from "@/features/crm/components/LeadsKanban";

export const metadata = {
  title: "CRM Leads Kanban | Vibecoding Admin",
};

export default function AdminLeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Leads Kanban Voronkasi</h1>
        <p className="text-xs text-ink-muted mt-1">
          Potentsial mijozlarni bosqichma-bosqich boshqaring (Yangi -&gt; Contacted -&gt; Consultation -&gt; Paid).
        </p>
      </div>

      <LeadsKanban />
    </div>
  );
}
