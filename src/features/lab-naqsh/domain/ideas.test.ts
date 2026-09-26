import { describe, expect, it } from "vitest";
import {
  IDEA_CHIPS,
  IDEA_IDS,
  IDEA_TEMPLATES,
  IDEA_TEXT_MAX_LENGTH,
  clampIdeaText,
  labelFor,
  matchIdeaFromText,
  templateFor,
} from "./ideas";

describe("matchIdeaFromText", () => {
  it("maps a store keyword to onlayn-dokon", () => {
    expect(matchIdeaFromText("men do'kon ochmoqchiman")).toBe("onlayn-dokon");
  });
  it("maps a course keyword to kurs-sayti", () => {
    expect(matchIdeaFromText("onlayn kurs sotmoqchiman")).toBe("kurs-sayti");
  });
  it("maps a bot keyword to telegram-bot", () => {
    expect(matchIdeaFromText("telegram uchun bot kerak")).toBe("telegram-bot");
  });
  it("falls back to the generic sayt for unknown ideas", () => {
    expect(matchIdeaFromText("restoran uchun sayt")).toBe("sayt");
  });
  it("falls back to sayt for empty or whitespace-only input", () => {
    expect(matchIdeaFromText("")).toBe("sayt");
    expect(matchIdeaFromText("   ")).toBe("sayt");
  });
  it("is case-insensitive and tolerant of apostrophe variants", () => {
    expect(matchIdeaFromText("DO‘KON OCHAMAN")).toBe("onlayn-dokon");
  });
  it("never throws on unusual input", () => {
    expect(() => matchIdeaFromText("!!!???$$$")).not.toThrow();
  });
});

describe("clampIdeaText", () => {
  it("passes short text through unchanged", () => {
    expect(clampIdeaText("kurs sayti")).toBe("kurs sayti");
  });
  it("clamps to the max length", () => {
    const long = "a".repeat(200);
    expect(clampIdeaText(long)).toHaveLength(IDEA_TEXT_MAX_LENGTH);
  });
});

describe("IDEA_TEMPLATES", () => {
  it("has a template for every declared idea id", () => {
    for (const id of IDEA_IDS) {
      expect(IDEA_TEMPLATES[id]).toBeDefined();
      expect(IDEA_TEMPLATES[id].blocks.length).toBeGreaterThanOrEqual(4);
    }
  });
  it("every template has exactly one header and one cta block", () => {
    for (const id of IDEA_IDS) {
      const kinds = IDEA_TEMPLATES[id].blocks.map((b) => b.kind);
      expect(kinds.filter((k) => k === "header")).toHaveLength(1);
      expect(kinds.filter((k) => k === "cta")).toHaveLength(1);
    }
  });
  it("the 3 chip ideas don't all share the same mock layout", () => {
    const layouts = new Set(IDEA_CHIPS.map((chip) => IDEA_TEMPLATES[chip.id].layout));
    expect(layouts.size).toBeGreaterThan(1);
  });
});

describe("templateFor / labelFor", () => {
  it("templateFor returns the matching template", () => {
    expect(templateFor("kurs-sayti").id).toBe("kurs-sayti");
  });
  it("labelFor returns the chip label for chip ideas", () => {
    for (const chip of IDEA_CHIPS) {
      expect(labelFor(chip.id)).toBe(chip.label);
    }
  });
  it("labelFor falls back to the site name for the generic idea", () => {
    expect(labelFor("sayt")).toBe(IDEA_TEMPLATES.sayt.siteName);
  });
});
