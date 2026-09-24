"use client";

import { useMemo } from "react";
import { encodeQrMatrix, qrSvgPath, QR_QUIET_ZONE } from "./qr";

export function TelegramQr({ value }: { value: string }) {
  const qr = useMemo(() => {
    const matrix = encodeQrMatrix(value);
    return {
      matrix,
      path: qrSvgPath(matrix),
      dimension: matrix.size + QR_QUIET_ZONE * 2,
    };
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${qr.dimension} ${qr.dimension}`}
      className="mx-auto hidden h-40 w-40 rounded-md bg-white p-1 [@media(pointer:_fine)_and_(min-width:640px)]:block"
      role="img"
      aria-label="Telegram orqali kirish uchun skanlanadigan QR kod"
      shapeRendering="crispEdges"
    >
      <rect width={qr.dimension} height={qr.dimension} className="fill-white" />
      <path d={qr.path} className="fill-[color:rgb(var(--shadow-color))]" />
    </svg>
  );
}
