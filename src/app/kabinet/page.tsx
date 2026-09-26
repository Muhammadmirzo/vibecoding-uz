import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth/session";
import { loadKabinetInitialData } from "@/features/lms/server/kabinet-dashboard";

const KabinetDashboardClient = dynamic(() => import("./KabinetDashboardClient"));

// Guest view must be server-rendered immediately: a signature-only cookie
// check (no DB call — see middleware.ts notes), then either the guest CTA
// or the client dashboard. Middleware lets a guest reach this exact route
// (it used to redirect every /kabinet request to "/", adding a round trip
// before any LCP-eligible content could paint).
export default async function KabinetPage() {
  const session = await getAuthSession();
  if (!session) return <KabinetGuestView />;
  // Logged-in: prefetch on the server so the dashboard ships in the first
  // HTML (LCP) instead of a skeleton + two client fetches. The prefetch
  // validates the session row itself and returns null on any DB problem, which
  // keeps the old client-fetch path instead of failing the route.
  const initialData = await loadKabinetInitialData({
    userId: session.userId,
    sessionId: session.sessionId ?? "",
  });
  return <KabinetDashboardClient initialData={initialData ?? undefined} />;
}

function KabinetGuestView() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <section className="mx-auto flex min-h-[calc(100vh-16rem)] w-full max-w-2xl flex-col items-center justify-center px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink md:text-3xl">
          Kabinetga kirish uchun tizimga kiring
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-ink-muted md:text-[17px]">
          Kurslaringiz, to&apos;lovlar va baholaringizni ko&apos;rish uchun avval hisobingizga kiring.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/?auth=1&redirect=%2Fkabinet" prefetch={false}>
            Kirish
          </Link>
        </Button>
      </section>
    </div>
  );
}
