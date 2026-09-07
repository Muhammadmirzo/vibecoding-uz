import { StudentActivityTracker } from "@/features/crm/components/StudentActivityTracker";

export const metadata = {
  title: "Talabalar Faolligi & Monitoring | Vibecoding Admin",
  description: "Talabalarning dars o'zlashtirishi, oxirgi online vaqti, uy vazifalari va quiz natijalari monitoringi",
};

export default function AdminStudentsPage() {
  return <StudentActivityTracker />;
}
