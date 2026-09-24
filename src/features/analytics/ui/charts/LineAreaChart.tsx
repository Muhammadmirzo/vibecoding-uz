import type { ChartPoint } from "./chart-types";

export function LineAreaChart({ data, title, description = "Vaqt bo'yicha trend" }: { data: ChartPoint[]; title: string; description?: string }) {
  const width = 720;
  const height = 240;
  const max = Math.max(1, ...data.map((point) => point.value));
  const coords = data.map((point, index) => ({ x: data.length <= 1 ? width / 2 : (index / (data.length - 1)) * width, y: height - (point.value / max) * (height - 24) - 12, ...point }));
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  const area = coords.length ? `0,${height} ${line} ${width},${height}` : "";
  return <figure className="space-y-3"><svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={`${title}. ${description}`}><title>{title}</title><desc>{description}</desc><path d={`M ${area}`} className="fill-accent" fillOpacity={0.14} /><polyline points={line} className="fill-none stroke-brand" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{coords.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="4" className="fill-gold"><title>{`${point.label}: ${point.value.toLocaleString("uz-UZ")}`}</title></circle>)}</svg><details className="text-sm text-ink-muted"><summary>Jadval ko‘rinishi</summary><div className="mt-2 overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="py-1">Davr</th><th className="py-1">Qiymat</th></tr></thead><tbody>{data.map((point) => <tr key={point.label} className="border-t border-border"><td className="py-1">{point.label}</td><td className="py-1">{point.value.toLocaleString("uz-UZ")}</td></tr>)}</tbody></table></div></details></figure>;
}
