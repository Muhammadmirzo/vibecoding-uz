import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import type { CredentialsState } from "./settingsTypes";

export function CredentialsSettingsForm({
  currentPassword, newPassword, confirmPassword, passwordLoading, passwordSuccess, passwordError,
  setCurrentPassword, setNewPassword, setConfirmPassword, handlePasswordSubmit,
}: CredentialsState) {
  return (
    <section className="max-w-2xl rounded-2xl border border-border bg-bg-elevated p-6 md:p-8">
      <div className="border-b border-border pb-5">
        <h2 className="font-display text-xl font-semibold text-ink">Parolni o&apos;zgartirish</h2>
        <p className="mt-2 text-base leading-relaxed text-ink-muted">Xavfsizlik uchun kamida 8 ta belgidan iborat murakkab paroldan foydalaning.</p>
      </div>
      {passwordSuccess ? <Status tone="success"><CheckCircle2 className="h-5 w-5" />Parol yangilandi.</Status> : null}
      {passwordError ? <Status tone="error"><AlertCircle className="h-5 w-5" />{passwordError}</Status> : null}
      <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
        <PasswordField id="current-password" label="Joriy parol" value={currentPassword} onChange={setCurrentPassword} />
        <PasswordField id="new-password" label="Yangi parol" value={newPassword} onChange={setNewPassword} />
        <PasswordField id="confirm-password" label="Yangi parolni tasdiqlang" value={confirmPassword} onChange={setConfirmPassword} />
        <Button type="submit" disabled={passwordLoading} className="w-full">
          {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
          {passwordLoading ? "Yangilanmoqda…" : "Parolni yangilash"}
        </Button>
      </form>
    </section>
  );
}

function PasswordField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} name={id} autoComplete={id === "current-password" ? "current-password" : "new-password"} type="password" value={value} onChange={(event) => onChange(event.target.value)} required /></div>;
}

function Status({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return <div role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"} className={`mt-5 flex items-center gap-2 rounded-lg border p-3 text-sm font-semibold ${tone === "success" ? "border-success bg-success-soft text-success" : "border-danger bg-bg-sunken text-danger"}`}>{children}</div>;
}
