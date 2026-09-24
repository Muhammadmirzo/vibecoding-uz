import qrcode from "qrcode-generator";

export const QR_QUIET_ZONE = 4;
export const QR_ERROR_CORRECTION = "M";

export interface QrMatrix {
  size: number;
  rows: string[];
}

export function encodeQrMatrix(value: string): QrMatrix {
  if (!value) throw new Error("QR value cannot be empty");
  const qr = qrcode(0, QR_ERROR_CORRECTION);
  qr.addData(value);
  qr.make();
  const size = qr.getModuleCount();
  const rows = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => qr.isDark(row, column) ? "1" : "0").join(""),
  );
  return { size, rows };
}

export function qrSvgPath(matrix: QrMatrix): string {
  const commands: string[] = [];
  matrix.rows.forEach((row, y) => {
    [...row].forEach((module, x) => {
      if (module === "1") {
        commands.push(`M${x + QR_QUIET_ZONE} ${y + QR_QUIET_ZONE}h1v1h-1z`);
      }
    });
  });
  return commands.join("");
}
