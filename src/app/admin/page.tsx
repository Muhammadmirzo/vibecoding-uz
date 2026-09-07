import Link from "next/link";
import {
  Kanban,
  GraduationCap,
  CheckSquare,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AdminOverviewPage() {
  const adminModules = [
    {
      href: "/admin/leads",
      title: "CRM Leads Pipeline (Kanban)",
      description: "Yangi kelgan mijozlar, drag&drop bosqichlar (Yangi -> Contacted -> Consultation -> Paid).",
      icon: Kanban,
      badge: "CRM Pipeline",
      color: "border-blue-500/30 bg-blue-500/5",
    },
    {
      href: "/admin/cohorts",
      title: "Guruhlar (Cohorts Management)",
      description: "Qabul guruhlari, o'rinlar soni (seats limit), early bird narxlari va muddati (expiration).",
      icon: GraduationCap,
      badge: "Guruhlar & Qabul",
      color: "border-purple-500/30 bg-purple-500/5",
    },
    {
      href: "/admin/homework",
      title: "Uy Vazifalari Navbati (Grading Queue)",
      description: "Amaliy topshiriqlarni rubrika mezonlari (0-10 score) va shablonlar bo'yicha baholash.",
      icon: CheckSquare,
      badge: "Uy Vazifalari",
      color: "border-amber-500/30 bg-amber-500/5",
    },
    {
      href: "/admin/analytics",
      title: "Platforma Analitikasi va Voronka",
      description: "Mijozlar voronkasi drop-off ko'rsatkichlari, konversiya darajasi va daromad statistikasi.",
      icon: BarChart3,
      badge: "Analitika",
      color: "border-emerald-500/30 bg-emerald-500/5",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Executive Welcome Hero */}
      <div className="bg-cream-warm border border-border rounded-xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Superadmin & CRM Panel
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Vibecoding Platformasi Boshqaruv Markazi
        </h1>
        <p className="text-sm text-ink-muted max-w-3xl leading-relaxed">
          Ushbu admin panel orqali potentsial mijozlar quvurini (leads pipeline), o'quv guruhlarini (cohorts),
          uy vazifalarini baholash navbatini va platforma konversiya analitikasini real vaqt rejimida boshqaring.
        </p>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className={`border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between space-y-4 ${mod.color}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2.5 rounded-lg bg-cream border border-border text-accent group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cream border border-border text-ink-muted">
                    {mod.badge}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-ink group-hover:text-accent transition-colors">
                  {mod.title}
                </h2>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-accent">
                <span>Bo'limga o'tish</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
