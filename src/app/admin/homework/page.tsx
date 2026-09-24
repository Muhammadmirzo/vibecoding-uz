import { HomeworkQueue } from "@/features/crm/components/HomeworkQueue";

export const metadata = {
  title: "Uy Vazifalari Navbati | Naqsh",
};

export default function AdminHomeworkPage() {
  return (
    <div className="space-y-6">
      <HomeworkQueue />
    </div>
  );
}
