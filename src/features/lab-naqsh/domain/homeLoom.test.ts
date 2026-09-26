import { describe, expect, it } from "vitest";
import { STRAND_KEYS } from "./strands";
import { HOME_LOOM_SECTIONS, mutedHomeStrands } from "./homeLoom";

describe("HOME_LOOM_SECTIONS", () => {
  it("registers slices E1-E4 (muammo -> square, usul -> diamond, dastur -> weave, natijalar -> ring)", () => {
    expect(HOME_LOOM_SECTIONS).toEqual([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
      { id: "dastur", strand: "weave" },
      { id: "natijalar", strand: "ring" },
    ]);
  });

  it("includes the natijalar section that claims the ring strand", () => {
    expect(HOME_LOOM_SECTIONS.some((section) => section.id === "natijalar")).toBe(true);
    expect(HOME_LOOM_SECTIONS.find((section) => section.id === "natijalar")?.strand).toBe("ring");
  });
});

describe("mutedHomeStrands", () => {
  it("mutes every strand except the registered ones and glow", () => {
    const muted = mutedHomeStrands();
    expect(muted).not.toContain("square");
    expect(muted).not.toContain("diamond");
    expect(muted).not.toContain("weave");
    expect(muted).not.toContain("ring");
    expect(muted).not.toContain("glow");
    // fill is the only strand still without a registered section.
    for (const strand of STRAND_KEYS) {
      if (strand === "fill") expect(muted).toContain(strand);
    }
  });

  it("un-mutes ring now that natijalar is registered", () => {
    expect(mutedHomeStrands()).not.toContain("ring");
  });

  it("still mutes ring when natijalar is absent from the registry", () => {
    const withoutNatijalar = mutedHomeStrands([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
      { id: "dastur", strand: "weave" },
    ]);
    expect(withoutNatijalar).toContain("ring");
  });

  it("un-mutes a strand once its section is registered", () => {
    const muted = mutedHomeStrands([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
      { id: "dastur", strand: "weave" },
    ]);
    expect(muted).not.toContain("diamond");
    expect(muted).not.toContain("weave");
  });

  it("un-mutes weave only because the dastur section is registered", () => {
    const withoutDastur = mutedHomeStrands([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
    ]);
    expect(withoutDastur).toContain("weave");
  });

  it("never mutes glow even with an empty registry", () => {
    expect(mutedHomeStrands([])).not.toContain("glow");
  });
});
