import { describe, expect, it } from "vitest";
import { STRAND_KEYS } from "./strands";
import { HOME_LOOM_SECTIONS, mutedHomeStrands } from "./homeLoom";

describe("HOME_LOOM_SECTIONS", () => {
  it("registers slice E1 and E2 (muammo -> square, usul -> diamond)", () => {
    expect(HOME_LOOM_SECTIONS).toEqual([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
    ]);
  });
});

describe("mutedHomeStrands", () => {
  it("mutes every strand except the registered ones and glow", () => {
    const muted = mutedHomeStrands();
    expect(muted).not.toContain("square");
    expect(muted).not.toContain("diamond");
    expect(muted).not.toContain("glow");
    for (const strand of STRAND_KEYS) {
      if (strand === "square" || strand === "diamond" || strand === "glow") continue;
      expect(muted).toContain(strand);
    }
  });

  it("un-mutes a strand once its section is registered", () => {
    const muted = mutedHomeStrands([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
    ]);
    expect(muted).not.toContain("diamond");
  });

  it("never mutes glow even with an empty registry", () => {
    expect(mutedHomeStrands([])).not.toContain("glow");
  });
});
