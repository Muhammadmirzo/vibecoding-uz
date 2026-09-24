"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/admin";
  const redirectTarget =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/admin";

  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

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

  return (
    <div className="w-full max-w-md bg-bg-elevated border border-border-strong rounded-xl p-6 sm:p-8 shadow-lg space-y-6">
      {/* Header Badge */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-sunken border border-border text-xs font-mono font-bold text-accent uppercase">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Naqsh admin paneli</span>
        </div>
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">
          Admin Panelga Kirish
        </h1>
        <p className="text-xs text-ink-muted max-w-xs mx-auto">
          Boshqaruv tizimiga kirish uchun elektron pochta yoki telefon raqamingiz hamda parolingizni kiriting.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="admin-login" className="mb-1.5 text-xs uppercase tracking-wider">
            Login (Email yoki Telefon)
          </Label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-4 text-ink-muted" aria-hidden="true" />
            <Input
              id="admin-login"
              type="text"
              required
              autoComplete="username"
              value={loginInput}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "admin-login-error" : undefined}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="admin@mirzo.uz yoki +998901234567"
              className="pl-10 text-base sm:text-sm"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="admin-password" className="mb-1.5 text-xs uppercase tracking-wider">
            Parol
          </Label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-4 text-ink-muted" aria-hidden="true" />
            <Input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "admin-login-error" : undefined}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="pl-10 text-base sm:text-sm"
            />
          </div>
        </div>

        {error && (
          <div ref={errorRef} tabIndex={-1} id="admin-login-error" role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !loginInput || !password}
          className="w-full text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Tekshirilmoqda…</span>
            </>
          ) : (
            <>
              <span>Admin panelga kirish</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="fixed inset-0 z-[60] flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-bg-sunken p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-bg-elevated border border-border-strong rounded-xl p-8 text-center text-sm font-mono text-ink-muted">
            Yuklanmoqda…
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
