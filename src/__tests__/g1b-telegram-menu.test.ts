import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { coursePriceLine } from "@/lib/telegram/handlers/commands";
import { MAIN_MENU, mainKeyboard } from "@/lib/telegram/handlers/menu";
import { siteConfig } from "@/lib/siteConfig";
import { COURSES, getCoursePricing } from "@/features/courses/content";

/** Flatten every label a visitor can tap in the reply keyboard. */
function keyboardLabels(): string[] {
  type Cell = string | { text: string };
  const rows = mainKeyboard.reply_markup.keyboard as Cell[][];
  return rows.flat().map((cell) => (typeof cell === "string" ? cell : cell.text));
}

/** The bot message is HTML, so decode entities before comparing with config text. */
function plain(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

describe("Telegram menu handlers (g1b)", () => {
  it("takes every price and installment from siteConfig, never a hardcoded number", () => {
    for (const slug of Object.keys(siteConfig.courses)) {
      const line = plain(coursePriceLine(slug));
      const pricing = getCoursePricing(slug);
      expect(line).toContain(pricing.price);
      expect(line).toContain(pricing.installment);
    }
  });

  it("no longer quotes the old wrong prices (2 990 000 / 990 000)", () => {
    const text = Object.keys(COURSES).map(coursePriceLine).join("\n");
    expect(text).not.toContain("2 990 000");
    expect(text).not.toContain("990 000");
  });

  it("quotes the price the site actually sells", () => {
    expect(plain(coursePriceLine("vibe-coding-express"))).toContain(siteConfig.courses["vibe-coding-express"].price);
    expect(plain(coursePriceLine("ai-asoslari"))).toContain(siteConfig.courses["ai-asoslari"].price);
  });

  it("has no dead calculator button and no label without a handler", () => {
    const labels = keyboardLabels();
    expect(labels.some((label) => /kalkulyator/i.test(label))).toBe(false);
    // Every keyboard label is a MAIN_MENU constant (i.e. a `bot.hears` target).
    const known: string[] = Object.values(MAIN_MENU);
    for (const label of labels) expect(known).toContain(label);
  });

  it("hardcodes neither the production domain nor an anchor in the handler source", () => {
    const source = readFileSync(
      join(process.cwd(), "src/lib/telegram/handlers/commands.ts"),
      "utf8",
    );
    expect(source).not.toContain("master-2-jade.vercel.app");
    expect(source).not.toContain("#kalkulyator");
    expect(source).toContain("siteConfig.siteUrl");
  });
});
