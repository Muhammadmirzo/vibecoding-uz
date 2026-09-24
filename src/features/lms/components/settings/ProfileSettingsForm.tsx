import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button, Input, Label, Textarea } from "@/components/ui";
import type { SettingsProfileState } from "./settingsTypes";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
};

function Field({ label, value, onChange, type = "text", required, disabled }: FieldProps) {
  const id = `profile-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const autoComplete = label === "F.I.SH." ? "name" : label === "Telefon" ? "tel" : label === "Email" ? "email" : label === "Avatar havolasi" ? "url" : undefined;
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} name={id} autoComplete={autoComplete} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} disabled={disabled} /></div>;
}

export function ProfileSettingsForm(props: SettingsProfileState) {
  const {
    fullName, email, phone, city, profession, goal, bio, avatarUrl,
    profileLoading, profileSuccess, profileError,
    setFullName, setEmail, setCity, setProfession, setGoal, setBio, setAvatarUrl,
    handleProfileSubmit,
  } = props;

  return (
    <section className="rounded-2xl border border-border bg-bg-elevated p-6 md:p-8">
      <div className="border-b border-border pb-5">
        <h2 className="font-display text-xl font-semibold text-ink">Shaxsiy profil</h2>
        <p className="mt-2 text-base leading-relaxed text-ink-muted">Kurs, mentorlik va sertifikat jarayonida ko&apos;rinadigan ma&apos;lumotlarni yangilang.</p>
      </div>

      {profileSuccess ? <StatusMessage tone="success"><CheckCircle2 className="h-5 w-5" />Profil saqlandi.</StatusMessage> : null}
      {profileError ? <StatusMessage tone="error"><AlertCircle className="h-5 w-5" />{profileError}</StatusMessage> : null}

      <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="F.I.SH." value={fullName} onChange={setFullName} required />
          <Field label="Telefon" value={phone} onChange={() => undefined} disabled />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Yashash shahri" value={city} onChange={setCity} />
          <Field label="Kasbi yoki soha" value={profession} onChange={setProfession} />
          <Field label="Avatar havolasi" value={avatarUrl} onChange={setAvatarUrl} type="url" />
        </div>
        <div><Label htmlFor="profile-goal">Kursdan asosiy maqsad</Label><Input id="profile-goal" value={goal} onChange={(event) => setGoal(event.target.value)} /></div>
        <div><Label htmlFor="profile-bio">Qisqacha bio</Label><Textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} rows={4} /></div>
        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" disabled={profileLoading}>
            {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {profileLoading ? "Saqlanmoqda…" : "O&apos;zgarishlarni saqlash"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function StatusMessage({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return <div role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"} className={`mt-5 flex items-center gap-2 rounded-lg border p-3 text-sm font-semibold ${tone === "success" ? "border-success bg-success-soft text-success" : "border-danger bg-bg-sunken text-danger"}`}>{children}</div>;
}
