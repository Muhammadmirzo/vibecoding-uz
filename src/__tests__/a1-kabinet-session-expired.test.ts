// A1 defect 4: a 401 from /api/me or /api/me/payments used to render the generic
// "Texnik xizmat vaqtincha ishlamayapti" box with a reload button — an infinite
// reload loop for an expired session. It must show a "log in again" state instead.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { kabinetErrorState, RELOGIN_HREF } from "@/features/lms/domain/kabinet-dashboard";

vi.mock("next/navigation", () => ({ usePathname: () => "/kabinet" }));

const { KabinetLoadError } = await import("@/app/kabinet/KabinetDashboardClient");

function render(status: number, message: string): string {
  return renderToStaticMarkup(createElement(KabinetLoadError, { error: { status, message } }));
}

describe("A1: /kabinet 401 handling", () => {
  it("classifies 401 as an expired session, not a technical error", () => {
    const view = kabinetErrorState(401);
    expect(view.unauthorized).toBe(true);
    expect(view.title).toBe("Sessiya tugadi, qayta kiring");
    expect(view.action).toEqual({ label: "Qayta kiring", href: "/?auth=1&redirect=%2Fkabinet" });
    expect(RELOGIN_HREF).toBe("/?auth=1&redirect=%2Fkabinet");
  });

  it("keeps every other status on the retry path", () => {
    for (const status of [0, 403, 404, 429, 500, 503]) {
      const view = kabinetErrorState(status, "Server javob bermadi");
      expect(view.unauthorized).toBe(false);
      expect(view.title).toBe("Texnik xizmat vaqtincha ishlamayapti");
      expect(view.action).toBeNull();
    }
  });

  it("renders the session-expired state with a login link and no reload button", () => {
    const html = render(401, "Sessiya muddati tugagan");
    expect(html).toContain("Sessiya tugadi, qayta kiring");
    expect(html).toContain("href=\"/?auth=1&amp;redirect=%2Fkabinet\"");
    expect(html).not.toContain("Qayta urinish");
    expect(html).not.toContain("Texnik xizmat vaqtincha ishlamayapti");
  });

  it("still renders the retry button for a non-401 failure", () => {
    const html = render(503, "Server javob bermadi");
    expect(html).toContain("Texnik xizmat vaqtincha ishlamayapti");
    expect(html).toContain("Server javob bermadi");
    expect(html).toContain("Qayta urinish");
    expect(html).not.toContain("Sessiya tugadi");
  });
});
