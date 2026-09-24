import { ImageResponse } from "next/og";
import { LogoMarkShapes } from "@/components/brand/Logo";
import { LOGO_HEX, LOGO_VIEWBOX } from "@/components/brand/logoGeometry";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — Naqsh girih mark on ivory. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: LOGO_HEX.ivory,
        }}
      >
        <svg width="132" height="132" viewBox={LOGO_VIEWBOX} fill="none">
          {LogoMarkShapes({ colors: LOGO_HEX })}
        </svg>
      </div>
    ),
    { ...size }
  );
}
