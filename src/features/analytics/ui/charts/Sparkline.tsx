export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * 100},${30 - (value / max) * 26}`).join(" ");
  return <svg viewBox="0 0 100 32" className="h-8 w-24" role="img" aria-label={label}><title>{label}</title><polyline points={points} className="fill-none stroke-accent" strokeWidth="2" strokeLinecap="round" /></svg>;
}
