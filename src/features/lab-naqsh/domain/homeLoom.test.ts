import { describe, expect, it } from "vitest";
import { STRAND_KEYS } from "./strands";
import { HOME_LOOM_SECTIONS, mutedHomeStrands } from "./homeLoom";

describe("HOME_LOOM_SECTIONS", () => {
  it("registers slices E1-E6 (muammo -> square, usul -> diamond, dastur -> weave, natijalar -> ring, narx -> fill, boshlash -> glow)", () => {
    expect(HOME_LOOM_SECTIONS).toEqual([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
      { id: "dastur", strand: "weave" },
      { id: "natijalar", strand: "ring" },
      { id: "narx", strand: "fill" },
      { id: "boshlash", strand: "glow" },
    ]);
  });

  it("registers all 6 story sections, one per strand in STRAND_KEYS", () => {
    expect(HOME_LOOM_SECTIONS).toHaveLength(STRAND_KEYS.length);
    expect(HOME_LOOM_SECTIONS.map((section) => section.strand).sort()).toEqual([...STRAND_KEYS].sort());
  });

  it("includes the boshlash section that claims the glow strand (the finished star)", () => {
    expect(HOME_LOOM_SECTIONS.some((section) => section.id === "boshlash")).toBe(true);
    expect(HOME_LOOM_SECTIONS.find((section) => section.id === "boshlash")?.strand).toBe("glow");
  });

  it("includes the natijalar section that claims the ring strand", () => {
    expect(HOME_LOOM_SECTIONS.some((section) => section.id === "natijalar")).toBe(true);
    expect(HOME_LOOM_SECTIONS.find((section) => section.id === "natijalar")?.strand).toBe("ring");
  });

  it("includes the narx section that claims the gold fill strand", () => {
    expect(HOME_LOOM_SECTIONS.some((section) => section.id === "narx")).toBe(true);
    expect(HOME_LOOM_SECTIONS.find((section) => section.id === "narx")?.strand).toBe("fill");
  });

  it("keeps the registry ids unique (one section per strand, no double claim)", () => {
    expect(new Set(HOME_LOOM_SECTIONS.map((section) => section.id)).size).toBe(HOME_LOOM_SECTIONS.length);
    expect(new Set(HOME_LOOM_SECTIONS.map((section) => section.strand)).size).toBe(HOME_LOOM_SECTIONS.length);
  });

  it("only ever claims strands the SVG actually has", () => {
    for (const section of HOME_LOOM_SECTIONS) {
      expect(STRAND_KEYS).toContain(section.strand);
    }
  });
});

describe("mutedHomeStrands", () => {
  it("mutes nothing now that all 6 story sections have shipped their strand", () => {
    const muted = mutedHomeStrands();
    expect(muted).not.toContain("square");
    expect(muted).not.toContain("diamond");
    expect(muted).not.toContain("weave");
    expect(muted).not.toContain("ring");
    expect(muted).not.toContain("fill");
    expect(muted).not.toContain("glow");
    // The star is fully woven: nothing is left as a faint guide.
    expect(muted).toEqual([]);
  });

  it("un-mutes glow now that boshlash is registered", () => {
    expect(mutedHomeStrands()).not.toContain("glow");
  });

  it("mutes glow again when boshlash is absent (no special case any more)", () => {
    const withoutBoshlash = mutedHomeStrands([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
      { id: "dastur", strand: "weave" },
      { id: "natijalar", strand: "ring" },
      { id: "narx", strand: "fill" },
    ]);
    expect(withoutBoshlash).toEqual(["glow"]);
  });

  it("un-mutes ring now that natijalar is registered", () => {
    expect(mutedHomeStrands()).not.toContain("ring");
  });

  it("un-mutes fill now that narx is registered", () => {
    expect(mutedHomeStrands()).not.toContain("fill");
  });

  it("still mutes fill when narx is absent from the registry", () => {
    const withoutNarx = mutedHomeStrands([
      { id: "muammo", strand: "square" },
      { id: "usul", strand: "diamond" },
      { id: "dastur", strand: "weave" },
      { id: "natijalar", strand: "ring" },
    ]);
    expect(withoutNarx).toContain("fill");
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

  it("mutes every strand with an empty registry, glow included", () => {
    expect(mutedHomeStrands([])).toEqual([...STRAND_KEYS]);
  });
});
