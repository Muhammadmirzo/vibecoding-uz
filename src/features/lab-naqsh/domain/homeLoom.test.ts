import { describe, expect, it } from "vitest";
import { STRAND_KEYS } from "./strands";
import { HOME_LOOM_SECTIONS, mutedHomeStrands } from "./homeLoom";

describe("HOME_LOOM_SECTIONS", () => {
  it("registers slices E1-E3 (muammo -> square, usul -> diamond, dastur -> weave)", () => {
    expect(HOME_LOOM_SECTIONS).toEqual([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
      { id: "dastur", strand: "weave" },
    ]);
  });
});

describe("mutedHomeStrands", () => {
  it("mutes every strand except the registered ones and glow", () => {
    const muted = mutedHomeStrands();
    expect(muted).not.toContain("square");
    expect(muted).not.toContain("diamond");
    expect(muted).not.toContain("weave");
    expect(muted).not.toContain("glow");
    for (const strand of STRAND_KEYS) {
      if (strand === "square" || strand === "diamond" || strand === "weave" || strand === "glow") continue;
      expect(muted).toContain(strand);
    }
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
