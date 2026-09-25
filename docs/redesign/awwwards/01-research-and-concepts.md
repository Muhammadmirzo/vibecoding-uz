# Naqsh → Awwwards: phase 1 (research + concepts)

Process: `awwwards-craft` skill. Date: 2026-09-25. Status: **owner picked A + C (2026-09-25)**: the "Naqsh to'qiladi" site system with the C live-demo hero. Next: 02-art-direction.md.
Owner constraint: **no Samarkand / Registan / historic-city references.** Keep the logo (girih star) as the brand core.

## 1. Winners analysed (Awwwards SOTD / Site of the Year)

| Site | Why it is relevant | Overall (D/U/C/Ct) | Tech | Palette |
| :--- | :--- | :--- | :--- | :--- |
| Messenger (abeto), Site of the Year 2025 | one tiny WebGL world = the whole story | 7.92 (8.04/7.46/8.23/8.15) | Three.js, WebGL | teal + sage |
| Why Zero, SOTD 2026-09-07 | AI-native education, immersive story | 7.73 (7.7/7.46/8.16/7.75) | GSAP, Three.js, Blender | white + green |
| Design Education Series (Obys) | education, principles as interactive lessons | 7.59 (7.67/7.46/7.54/7.75) | CSS animation, Contentful | charcoal + light grey |
| L.I.S.A. (Locomotive) | AI assistant as the interface | 7.48 (7.45/7.22/7.89/7.61) | WebGL, GSAP | black + white |
| Illoca | AI design engine; blue + cream close to Naqsh | 7.44 (7.33/7.43/7.7/7.36) | WebGL, 3D | #3B60C5 + #FDF2DE |
| AI in Design Report 2026 | data + editorial motion | 7.40 (7.66/7.21/7.14/7.38) | Framer | – |
| Cerebrium | AI infra, data-viz storytelling | 7.39 | GSAP, Three.js | deep blue + purple |
| Squarespace Foundations (Resn) | brand principles as a scroll story | 7.38 | GSAP | white + dark grey |
| Sobha Privy Collection | luxury, zoom-on-scroll, WebGL gallery | 7.37 | Three.js | monochrome |
| The Tie-break (Merci Michel), SOTD 2026-09-25 | playable brand experience | 7.28 | Three.js | white |
| Pensatori Irrazionali | great 404, micro-interactions | 7.23 | WebGL, GSAP | greys |
| Aardvark Book Club | culture + e-commerce, "unboxing" transitions | 7.20 | GSAP, Barba, Webflow | white + pale yellow |

## 2. Patterns (what the winners share)
1. One metaphor carries the whole site (a planet, a report, a brand book). Every effect serves it.
2. Two colors plus neutrals. One accent, used rarely.
3. GSAP in 9/12 and Three.js/WebGL in 9/12, but WebGL is used for **one** signature moment, not everywhere.
4. Creativity is the highest-scoring criterion. Usability is the lowest, so good usability is an easy edge.
5. Dev-award sub-scores: animation and responsive score high (8.0); accessibility and semantics score lowest (7.0-7.2).
   Our quality gate (a11y, SEO, perf) is a real advantage here.
6. The top content score (Messenger 8.15) comes from a story, not from feature lists.

## 3. Three concept directions (the owner picks one)

### A. "Naqsh to'qiladi" (the ornament weaves itself)
- Metaphor: learning to build with AI = weaving a girih. Every lesson adds a line; the finished star is your product.
- Signature moment: on scroll, the girih star is drawn line by line (stroke-draw + ScrollTrigger scrub). Each section
  is one tile of the pattern. At the end the full tessellation shines in gold and becomes the CTA.
- Refs: Squarespace Foundations (principles as a scroll story), Design Education Series (lessons as interaction),
  Illoca (blue + cream palette).
- Type: Unbounded (display, huge) + Onest. Palette from the logo only: deep blue + ivory, gold only on the final star and CTA.
- Tech: SVG + GSAP ScrollTrigger + Lenis; no heavy WebGL. Risk: low. Performance: excellent. Effort: ~2-3 weeks.

### B. "Loyihalar osmoni" (a sky of real projects)
- Metaphor: every project built with vibe coding is a star; Naqsh's girih star is the one that guides you.
- Signature moment: a WebGL night sky. The logo's 8-point star sits in the centre. Scrolling flies through a
  constellation where each star is a **real** project (hover shows its name and a screenshot). At the end the
  visitor's own "empty star" waits: "Sizning loyihangiz".
- Refs: Messenger (one 3D world), Why Zero (immersive education story), Cerebrium (data as a scene).
- Type: Unbounded (display) + Onest. Palette: deep night blue, white stars, gold only for the guiding star and CTA.
- Tech: Three.js/R3F points + a light shader, no 3D models needed. Risk: medium-high (phone performance,
  and it needs enough real projects; the honesty rule forbids fake stars). Effort: ~4-5 weeks.

### C. "Promptdan saytgacha" (from prompt to product, live)
- Metaphor: the site shows vibe coding by building itself.
- Signature moment: the hero terminal takes the visitor's idea (in Uzbek). The page then assembles from girih
  "blocks" into a mini site for that idea. It is a scripted demo, clearly labelled "namuna" (honesty rule).
- Refs: L.I.S.A. (AI as the interface), The Tie-break (playable), AI in Design Report (editorial data).
- Type: JetBrains Mono for the terminal + Unbounded + Onest. Palette: dark night-blue mode, turquoise cursor, gold result.
- Tech: GSAP Flip + timelines, no 3D. Risk: medium (the demo must feel magical, not fake). Effort: ~3-4 weeks.
  Also the strongest for conversion: it shows the product in 10 seconds.

## 4. Recommendation
**A as the site system + C's live demo as the hero.** The brand already owns the girih, and A turns it into the story.
C gives the "wow" in the first 10 seconds and sells the course. Both run without heavy WebGL, so we keep 60fps
and a fast LCP on phones, where most Uzbek visitors are. B has the highest wow ceiling but needs many real projects and more phone-performance work; keep it for a
later push when the portfolio is bigger.
