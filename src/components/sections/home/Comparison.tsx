import { Container, Section } from "@/components/ui";

const rows = [
  ["Natija", "Amaliy loyiha", "Dasturchiga bog'liq", "Nazariy bilim"],
  ["Nazorat", "Siz qaror qabul qilasiz", "Jamoa va muddat", "Yolg'iz o'rganish"],
  ["Feedback", "Mentor bilan sprintlar", "Talab bo'yicha", "Qiyin o'rganiladi"],
  ["Tezlik", "8 haftalik yo'l", "Vaqt va byudjetga bog'liq", "O'z tezligizda"],
] as const;

export function Comparison() {
  return <Section pattern={false} className="bg-bg"><Container><div className="max-w-2xl"><p className="mb-4 text-sm font-semibold text-brand">Yo'lni tanlash</p><h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Nima o'zgaradi?</h2></div><div className="mt-10 overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[680px] border-collapse text-left text-sm"><thead className="bg-bg-sunken"><tr><th className="p-4 text-ink-muted">Mezon</th><th className="p-4 text-brand">VibeCoding.uz</th><th className="p-4 text-ink-muted">An'anaviy bootcamp</th><th className="p-4 text-ink-muted">YouTube</th></tr></thead><tbody>{rows.map(([label, ...values]) => <tr key={label} className="border-t border-border"><th className="p-4 font-semibold text-ink">{label}</th>{values.map((value) => <td key={value} className="p-4 text-ink-muted">{value}</td>)}</tr>)}</tbody></table></div></Container></Section>;
}
