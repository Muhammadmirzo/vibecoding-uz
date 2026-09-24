import type { FieldProps } from "./types";

export function Field({ label, value, onChange, type = "text", placeholder, mono = false }: FieldProps) {
  return <label className="block text-xs font-medium text-ink">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`mt-1 w-full rounded-lg border border-border bg-bg-elevated px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${mono ? "font-mono" : ""}`} /></label>;
}

export function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-start justify-between gap-3 rounded-lg border border-border bg-bg-elevated p-3.5"><span><span className="block text-sm font-semibold text-ink">{label}</span><span className="mt-1 block text-xs leading-relaxed text-ink-muted">{description}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 cursor-pointer rounded accent-accent" /></label>;
}

export function SecretField({ label, value, onChange, visible, onToggle, placeholder }: FieldProps & { visible: boolean; onToggle: () => void }) {
  return <div className="relative"><Field label={label} value={value} onChange={onChange} type={visible ? "text" : "password"} placeholder={placeholder} mono /><button type="button" onClick={onToggle} className="absolute right-3 top-7 text-xs font-semibold text-accent">{visible ? "Yashirish" : "Ko‘rsatish"}</button></div>;
}
