import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";
import { LogoMarkShapes } from "@/components/brand/Logo";
import { LOGO_VIEWBOX } from "@/components/brand/logoGeometry";
import { COURSES, getCoursePricing } from "@/features/courses/content";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const IVORY = "#FAF7F0";
const LAPIS = "#0E1A2B";
const LAPIS_MUTED = "#4A5568";
const BRAND_BLUE = "#1440A0";
const GOLD = "#E8A317";

/** Same fonts as the root OG image, fetched at request time with a hard cap. */
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
    return await fetch(match[1]).then((r) => {
      if (!r.ok) throw new Error(`font bin ${r.status}`);
      return r.arrayBuffer();
    });
  } catch {
    return null;
  }
}

function NaqshMark({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox={LOGO_VIEWBOX} fill="none">
      {LogoMarkShapes({ colors: { square: BRAND_BLUE, diamond: GOLD, caret: GOLD } })}
    </svg>
  );
}

/** Per-course OG image: title, honest duration and the real price. */
export default async function CourseOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = COURSES[slug];
  if (!course) return new ImageResponse(<div>Naqsh</div>, size);

  const pricing = getCoursePricing(slug);
  const fontData = await loadDisplayFont();
  const displayFamily = fontData ? "Unbounded" : "system-ui, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: IVORY,
          padding: "64px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <NaqshMark s={64} />
          <div style={{ fontFamily: displayFamily, fontWeight: 700, fontSize: 40, color: LAPIS }}>naqsh</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
          <div style={{ fontFamily: displayFamily, fontWeight: 600, fontSize: 62, lineHeight: 1.1, color: LAPIS }}>
            {course.title}
          </div>
          <div style={{ marginTop: 20, fontSize: 30, color: LAPIS_MUTED }}>{course.outcomes[0]}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 30 }}>
          <span style={{ fontFamily: displayFamily, fontWeight: 700, color: BRAND_BLUE }}>{pricing.price}</span>
          <span style={{ color: LAPIS_MUTED }}>{course.duration}</span>
          <span style={{ color: LAPIS_MUTED }}>{BRAND.name}</span>
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
