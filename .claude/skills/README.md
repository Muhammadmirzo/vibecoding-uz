# Project skills

Installed 2026-09-25. Claude Code loads these automatically; ask by name (e.g. `/cro`) or just describe the task.

| Source | Commit | License | Skills |
| --- | --- | --- | --- |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 5b2c000 | MIT (`LICENSE-marketingskills`) | product-marketing, cro, copywriting, copy-editing, seo-audit, ai-seo, schema, pricing, offers, onboarding, signup, referrals, emails, lead-magnets, free-tools, launch, marketing-psychology, analytics, ab-testing, churn-prevention |
| [anthropics/skills](https://github.com/anthropics/skills) | 3337550 | Apache-2.0 (`LICENSE.txt` in each) | frontend-design, webapp-testing |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 063bee9 | MIT | react-best-practices, composition-patterns, web-design-guidelines |

Local changes: `evals/` folders dropped; `frontend-design` and `web-design-guidelines`
got a "Project overrides" section; `web-design-guidelines` reads a vendored
`guidelines.md` instead of fetching rules at runtime.

Marketing skills read shared context from `.agents/product-marketing.md` — keep it current (`/product-marketing`).
Project rules (AGENTS.md, theme tokens, Uzbek copy) always override skill advice.
