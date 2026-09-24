import Link from "next/link";
import { Brand } from "./Brand";
import { DesktopNav } from "./DesktopNav";
import { SiteBanner } from "./SiteBanner";
import { HeaderControls } from "./HeaderControls";
import { HeaderShell } from "./HeaderShell";
import { HeaderVisibility } from "./HeaderVisibility";

export { Footer } from "./Footer";

export function Header() {
  return (
    <HeaderVisibility>
      <SiteBanner />
      <HeaderShell>
        <Brand />
        <DesktopNav />
        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/diagnostika"
            className="btn-press hidden min-h-11 items-center rounded-lg bg-gold px-4 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-gold-hover sm:inline-flex"
          >
            Bepul diagnostika
          </Link>
          <HeaderControls />
        </div>
      </HeaderShell>
    </HeaderVisibility>
  );
}
