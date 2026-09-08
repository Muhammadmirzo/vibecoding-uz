"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin";

  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput || !password || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: loginInput.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Login yoki parol noto'g'ri");
        setIsLoading(false);
        return;
      }

      // Check if user is staff/admin
      const role = data.user?.role;
      if (!role || !["superadmin", "admin", "manager", "mentor"].includes(role)) {
        setError("Ushbu hisob admin panelga kirish huquqiga ega emas");
        setIsLoading(false);
        return;
      }

      // Successful login -> Redirect to target admin route
      router.push(redirectTarget);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tizimda xatolik yuz berdi");
      setIsLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setLoginInput("admin@mirzo.uz");
    setPassword("Admin2026Secure!");
    setError(null);
  };

  return (
    <div className="w-full max-w-md bg-[var(--color-cream)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-[var(--shadow-lg)] space-y-6">
      {/* Header Badge */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-cream-warm)] border border-[var(--color-accent-line)] text-xs font-mono font-bold text-[var(--color-accent)] uppercase">
          <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Mirzo Academy Admin Portal</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--color-ink)] tracking-tight">
          Admin Panelga Kirish
        </h1>
        <p className="text-xs text-[var(--color-ink-muted)] max-w-xs mx-auto">
          Boshqaruv tizimiga kirish uchun elektron pochta yoki telefon raqamingiz hamda parolingizni kiriting.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
            Login (Email yoki Telefon)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--color-ink-muted)]" />
            <input
              type="text"
              required
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="admin@mirzo.uz yoki +998901234567"
              className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cream-warm)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-1.5">
            Parol
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--color-ink-muted)]" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cream-warm)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !loginInput || !password}
          className="w-full h-12 rounded-[var(--radius-md)] btn-primary font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Tekshirilmoqda...</span>
            </>
          ) : (
            <>
              <span>Admin panelga kirish</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Fast Fill Helper */}
      <div className="pt-4 border-t border-[var(--color-border)] text-center space-y-2">
        <p className="text-[11px] text-[var(--color-ink-subtle)]">
          Test rejimida admin sifatida kirish:
        </p>
        <button
          type="button"
          onClick={handleFillDemoAdmin}
          className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream-warm)] hover:bg-[var(--color-cream-deep)] text-xs font-mono text-[var(--color-ink)] transition-colors"
        >
          admin@mirzo.uz (Superadmin ma'lumotlarini to'ldirish)
        </button>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream-warm)] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-[var(--color-cream)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-8 text-center text-sm font-mono text-[var(--color-ink-muted)]">
            Yuklanmoqda...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
