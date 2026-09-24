import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { BRAND } from "@/config/brand";

export function Brand() {
  return (
    <Link
      href="/"
      prefetch
      className="flex min-h-11 shrink-0 items-center rounded-md px-1 text-ink"
      aria-label={`${BRAND.name} bosh sahifa`}
    >
      <Logo size={30} />
    </Link>
  );
}
