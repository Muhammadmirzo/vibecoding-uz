import { HomeworkQueue } from "@/features/crm/components/HomeworkQueue";

export const metadata = {
  title: "Uy Vazifalari Navbati | Vibecoding Admin",
};

export default function AdminHomeworkPage() {
  return (
    <div className="space-y-6">
      <HomeworkQueue />
    </div>
  );
}
