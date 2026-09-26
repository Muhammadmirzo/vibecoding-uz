import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// KabinetNav calls usePathname(); stub it so the client island can be
// server-rendered in a node environment (this is what the browser first paints).
vi.mock("next/navigation", () => ({ usePathname: () => "/kabinet" }));

const { default: KabinetDashboardClient } = await import(
  "@/app/kabinet/KabinetDashboardClient"
);

function render(props: Parameters<typeof KabinetDashboardClient>[0]): string {
  return renderToStaticMarkup(createElement(KabinetDashboardClient, props));
}

describe("KabinetDashboardClient server render", () => {
  it("renders the real dashboard (no skeleton) when initialData is prefetched", () => {
    const html = render({
      initialData: { user: { fullName: "Ali Karimov" }, payments: [{ enrollmentId: "enr-1", status: "paid" }] },
    });

    expect(html).toContain("Xush kelibsiz, Ali Karimov");
    expect(html).toContain("Faol a&#x27;zolik");
    expect(html).not.toContain("aria-busy=\"true\"");
  });

  it("still renders the skeleton without initialData, so the client fetch path is unchanged", () => {
    const html = render({});

    expect(html).toContain("aria-busy=\"true\"");
  });
});
