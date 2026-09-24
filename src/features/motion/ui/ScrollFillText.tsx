import { cn } from "@/components/ui/utils";

interface ScrollFillTextProps {
  text: string;
  className?: string;
}

/**
 * Scroll-progress text fill without animating paint properties: a readable
 * muted base and a gradient duplicate revealed with clip-path.
 */
export function ScrollFillText({ text, className }: ScrollFillTextProps) {
  return (
    <span className={cn("scroll-fill-text", className)}>
      <span>{text}</span>
      <span className="scroll-fill-base" aria-hidden="true">{text}</span>
    </span>
  );
}
