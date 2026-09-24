import { cn } from "@/components/ui/utils";

interface SuccessCheckProps {
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Success check-mark with a stroke draw. Mounts in its final state —
 * the draw animation only runs under motion gates. Pure CSS, zero JS.
 * Used for lead-form / funnel success moments.
 */
export function SuccessCheck({ size = 48, className, label = "Muvaffaqiyatli" }: SuccessCheckProps) {
  return (
    <span
      role="img"
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn("success-check", className)}
    >
      <svg viewBox="0 0 52 52" width={size} height={size} fill="none" aria-hidden="true">
        <circle className="sc-circle" cx="26" cy="26" r="24" pathLength={1} />
        <path className="sc-check" d="M15 27l7.5 7.5L37 19" pathLength={1} />
      </svg>
    </span>
  );
}
