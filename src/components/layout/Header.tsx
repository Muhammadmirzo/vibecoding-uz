import { Button } from "@/components/ui/Button";
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
          <Button href="/diagnostika" data-track="header_diagnostic" size="sm" className="px-3.5 sm:px-4">
            <span className="sm:hidden">Diagnostika</span>
            <span className="hidden sm:inline">Bepul diagnostika</span>
          </Button>
          <HeaderControls />
        </div>
      </HeaderShell>
    </HeaderVisibility>
  );
}
