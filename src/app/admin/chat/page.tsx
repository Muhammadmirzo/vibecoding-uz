import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-auth";
import { AdminInbox } from "@/features/chat/ui/AdminInbox";

export default async function ChatAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/admin/login");
  const { conversation } = await searchParams;
  return <AdminInbox initialConversationId={conversation} />;
}
