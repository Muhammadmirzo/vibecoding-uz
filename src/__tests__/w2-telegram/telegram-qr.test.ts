import { describe, expect, it } from "vitest";
import { encodeQrMatrix, qrSvgPath, QR_QUIET_ZONE } from "@/features/auth/components/qr";

const HELLO_WORLD_MATRIX = [
  "111111101000101111111",
  "100000101000101000001",
  "101110100000001011101",
  "101110101010101011101",
  "101110100111001011101",
  "100000100011101000001",
  "111111101010101111111",
  "000000001111100000000",
  "101101110101101001011",
  "011000010111111101100",
  "000001111101010100011",
  "101011011001000101010",
  "100010110110110000101",
  "000000001011001100101",
  "111111101011111110000",
  "100000101110010101111",
  "101110100100101001000",
  "101110101110001001110",
  "101110101100100100100",
  "100000100111011110001",
  "111111101101010100000",
];

describe("Telegram QR encoder", () => {
  it("matches the known-good QR M matrix for HELLO WORLD", () => {
    const matrix = encodeQrMatrix("HELLO WORLD");
    expect(matrix).toEqual({ size: 21, rows: HELLO_WORLD_MATRIX });
  });

  it("adds a four-module quiet zone and emits scannable SVG module paths", () => {
    const matrix = encodeQrMatrix("https://t.me/naqsh_bot?start=login_test");
    const path = qrSvgPath(matrix);
    expect(QR_QUIET_ZONE).toBe(4);
    expect(path).toMatch(/^M4 4h1v1h-1z/);
    expect(path.split("M")).toHaveLength(matrix.rows.join("").split("1").length);
  });
});
