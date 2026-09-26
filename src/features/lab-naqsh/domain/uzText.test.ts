import { describe, expect, it } from "vitest";
import { UZ_GHEIRA_U02BB, uzDisplay } from "./uzText";

describe("uzDisplay", () => {
  it("uses U+02BB for the oʻ/gʻ letter so display fonts don't fall back", () => {
    expect(uzDisplay("G'oyangizni")).toBe(`G${UZ_GHEIRA_U02BB}oyangizni`);
    expect(uzDisplay("to'g'ri")).toBe(`to${UZ_GHEIRA_U02BB}g${UZ_GHEIRA_U02BB}ri`);
  });

  it("leaves already-correct text untouched", () => {
    const correct = `Eski yo${UZ_GHEIRA_U02BB}l`;
    expect(uzDisplay(correct)).toBe(correct);
  });

  it("passes text without an apostrophe through unchanged", () => {
    expect(uzDisplay("8 hafta. Har hafta — bitta yangi qatlam.")).toBe("8 hafta. Har hafta — bitta yangi qatlam.");
  });
});
