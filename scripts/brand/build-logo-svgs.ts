/**
 * Regenerates the static logo SVGs from src/components/brand/logoGeometry.ts.
 * Run after changing the geometry: `npx tsx scripts/brand/build-logo-svgs.ts`
 */
import { writeFileSync } from "node:fs";
import { LOGO_HEX, LOGO_VIEWBOX, logoMarkInnerSvg } from "../../src/components/brand/logoGeometry";

const color = logoMarkInnerSvg(LOGO_HEX);
const mono = logoMarkInnerSvg({ square: "currentColor", diamond: "currentColor", caret: "currentColor" });
const indent = (s: string, pad: string) => s.split("\n").map((l) => pad + l).join("\n");

const files: Record<string, string> = {
  "public/brand/naqsh-mark.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="${LOGO_VIEWBOX}" fill="none" role="img" aria-label="Naqsh">
  <title>Naqsh</title>
${color}
</svg>
`,
  "public/brand/naqsh-mark-mono.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="${LOGO_VIEWBOX}" fill="none" role="img" aria-label="Naqsh">
  <title>Naqsh</title>
${mono}
</svg>
`,
  "public/brand/naqsh-logo.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="96" viewBox="0 0 160 48" fill="none" role="img" aria-label="Naqsh">
  <title>Naqsh</title>
  <g transform="translate(8,8)">
${indent(color, "  ")}
  </g>
  <text x="48" y="31" font-family="Unbounded, 'Arial Rounded MT Bold', system-ui, sans-serif" font-size="19" font-weight="600" letter-spacing="-0.9" fill="${LOGO_HEX.ink}">naqsh</text>
</svg>
`,
  "src/app/icon.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="${LOGO_VIEWBOX}" fill="none" role="img" aria-label="Naqsh">
  <title>Naqsh</title>
  <rect width="32" height="32" rx="7" fill="${LOGO_HEX.ivory}"/>
  <g transform="translate(2.4,2.4) scale(0.85)">
${indent(color, "  ")}
  </g>
</svg>
`,
};

for (const [path, content] of Object.entries(files)) {
  writeFileSync(path, content);
  console.log("wrote", path);
}
