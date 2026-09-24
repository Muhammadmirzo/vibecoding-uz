import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";
import { LogoMarkShapes } from "@/components/brand/Logo";
import { LOGO_DIAMOND, LOGO_VIEWBOX } from "@/components/brand/logoGeometry";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Naqsh — AI bilan mahsulot yaratish maktabi";

const IVORY = "#FAF7F0";
const LAPIS = "#0E1A2B";
const LAPIS_MUTED = "#4A5568";
const BRAND_BLUE = "#1440A0";
const GOLD = "#E8A317";
const ACCENT = "#0FA3A3";

async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" }, signal: controller.signal }
    ).then((r) => {
      if (!r.ok) throw new Error(`font css ${r.status}`);
      return r.text();
    });
    clearTimeout(timer);
    const match = css.match(/url\((https:[^)]+\.woff2)\)/);
    if (!match) return null;
    const data = await fetch(match[1]).then((r) => {
      if (!r.ok) throw new Error(`font bin ${r.status}`);
      return r.arrayBuffer();
    });
    return data;
  } catch {
    return null;
  }
}

function GirihTile({ s, opacity }: { s: number; opacity: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" opacity={opacity}>
      <rect x="7" y="7" width="18" height="18" stroke={BRAND_BLUE} strokeWidth="1.5" />
      <path d={LOGO_DIAMOND} stroke={BRAND_BLUE} strokeWidth="1.5" />
    </svg>
  );
}

function NaqshMark({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox={LOGO_VIEWBOX} fill="none">
      {LogoMarkShapes({ colors: { square: BRAND_BLUE, diamond: GOLD, caret: ACCENT } })}
    </svg>
  );
}

/** Dynamic OG image — ivory/lapis, logo, tagline, girih pattern, 1200×630. */
export default async function OpengraphImage() {
  const fontData = await loadDisplayFont();
  const displayFamily = fontData ? "Unbounded" : "system-ui, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: IVORY,
          padding: "72px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", right: -70, top: -70, display: "flex" }}>
          <GirihTile s={420} opacity={0.07} />
        </div>
        <div style={{ position: "absolute", left: -90, bottom: -80, display: "flex" }}>
          <GirihTile s={300} opacity={0.06} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <NaqshMark s={72} />
            <div style={{ fontFamily: displayFamily, fontWeight: 700, fontSize: 48, letterSpacing: -2, color: LAPIS }}>
              naqsh
            </div>
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: displayFamily,
              fontWeight: 600,
              fontSize: 40,
              lineHeight: 1.25,
              color: LAPIS,
            }}
          >
            {BRAND.tagline}
          </div>
          <div style={{ marginTop: 20, fontSize: 26, color: LAPIS_MUTED }}>{BRAND.descriptor}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <NaqshMark s={280} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Unbounded", data: fontData, weight: 700 as const, style: "normal" as const }]
        : undefined,
    }
  );
}
