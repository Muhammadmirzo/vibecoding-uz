import { LOGO_DIAMOND } from "@/components/brand/logoGeometry";
import { cn } from "@/components/ui/utils";

/**
 * A tiny girih tile icon (square or diamond), built from the same
 * logoGeometry constants as the brand mark and the loom star — the "small
 * squares/diamonds built from the logo geometry" the hero demo assembles.
 */
export function TileShape({ shape, className }: { shape: "square" | "diamond"; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={cn("size-3.5 shrink-0", className)}>
      {shape === "diamond" ? (
        <path d={LOGO_DIAMOND} fill="currentColor" />
      ) : (
        <rect x="7" y="7" width="18" height="18" fill="currentColor" />
      )}
    </svg>
  );
}
