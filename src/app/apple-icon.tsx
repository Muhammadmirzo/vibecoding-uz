import { ImageResponse } from "next/og";

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
          backgroundColor: "#FAF7F0",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32" fill="none">
          <rect x="8" y="8" width="16" height="16" stroke="#1440A0" strokeWidth="2.75" />
          <path
            d="M16 5 L27 16 L16 27 L5 16 Z"
            stroke="#E8A317"
            strokeWidth="2.75"
            strokeLinejoin="round"
            strokeDasharray="12.756 2.8"
            strokeDashoffset={9.913}
          />
          <g stroke="#0FA3A3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13.5,12.5 17.5,16 13.5,19.5" />
            <line x1="20.5" y1="12.5" x2="20.5" y2="19.5" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}
