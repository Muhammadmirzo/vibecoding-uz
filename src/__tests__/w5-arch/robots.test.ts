import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

const DISALLOW = ["/admin", "/api/", "/kabinet", "/design-system"];

describe("robots", () => {
  it("keeps the wildcard allow/disallow rule", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcard = rules.find((rule) => rule.userAgent === "*");
    expect(wildcard).toBeDefined();
    expect(wildcard?.allow).toBe("/");
    expect(wildcard?.disallow).toEqual(DISALLOW);
  });

  it("adds an explicit allow rule with the same disallow list for each AI crawler", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const aiAgents = [
      "GPTBot",
      "ChatGPT-User",
      "OAI-SearchBot",
      "ClaudeBot",
      "Claude-SearchBot",
      "PerplexityBot",
      "Google-Extended",
      "Bingbot",
    ];
    for (const agent of aiAgents) {
      const rule = rules.find((entry) => entry.userAgent === agent);
      expect(rule, `missing rule for ${agent}`).toBeDefined();
      expect(rule?.allow).toBe("/");
      expect(rule?.disallow).toEqual(DISALLOW);
    }
  });

  it("still points to the sitemap and host", () => {
    const result = robots();
    expect(result.sitemap).toContain("/sitemap.xml");
    expect(result.host).toBeTruthy();
  });
});
