import "qrcode-generator";

declare global {
  interface QRCode {
    getModuleCount(): number;
    isDark(row: number, column: number): boolean;
  }
}

export {};
