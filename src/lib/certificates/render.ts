import { rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { CertificateTemplateData } from "./template";

interface CertificateFonts {
  regular: PDFFont;
  bold: PDFFont;
  title: PDFFont;
}

/** Renders the fixed certificate design onto an A4 landscape page. */
export function renderCertificateTemplate(
  page: PDFPage,
  width: number,
  height: number,
  data: CertificateTemplateData,
  fonts: CertificateFonts
): void {
  const { regular, bold, title } = fonts;
  const bgCream = rgb(0.98, 0.97, 0.95);
  const darkInk = rgb(0.1, 0.12, 0.18);
  const accentGold = rgb(0.85, 0.65, 0.15);
  const borderNavy = rgb(0.08, 0.15, 0.32);
  const textMuted = rgb(0.4, 0.45, 0.52);

  page.drawRectangle({ x: 0, y: 0, width, height, color: bgCream });
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: borderNavy,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: accentGold,
    borderWidth: 1.5,
  });

  const drawCenteredText = (
    text: string,
    y: number,
    size: number,
    font: PDFFont,
    color = darkInk
  ): void => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
  };

  drawCenteredText("NAQSH", height - 85, 14, bold, accentGold);
  drawCenteredText("RASMIY TA'LIM SERTIFIKATI", height - 108, 11, regular, textMuted);
  drawCenteredText("SERTIFIKAT", height - 170, 36, title, borderNavy);
  drawCenteredText(
    "Ushbu sertifikat egasi quyidagi kursni muvaffaqiyatli yakunlaganligini tasdiqlaydi:",
    height - 215,
    13,
    regular,
    darkInk
  );
  drawCenteredText(data.holderName, height - 265, 28, bold, borderNavy);

  const nameWidth = bold.widthOfTextAtSize(data.holderName, 28);
  const lineWidth = Math.max(nameWidth + 40, 200);
  page.drawLine({
    start: { x: (width - lineWidth) / 2, y: height - 275 },
    end: { x: (width + lineWidth) / 2, y: height - 275 },
    thickness: 2,
    color: accentGold,
  });

  drawCenteredText(
    `KURSNI NOMI: "${data.courseTitle.toUpperCase()}"`,
    height - 325,
    16,
    bold,
    darkInk
  );
  drawCenteredText(
    `Yakuniy Natija: ${data.finalScore} / 10 ball`,
    height - 355,
    13,
    bold,
    accentGold
  );

  page.drawText("Berilgan vaqti:", {
    x: 70, y: 110, size: 10, font: regular, color: textMuted,
  });
  page.drawText(data.dateFormatted, {
    x: 70, y: 92, size: 12, font: bold, color: darkInk,
  });

  const rightX = width - 240;
  page.drawText("Platforma rahbari:", {
    x: rightX, y: 110, size: 10, font: regular, color: textMuted,
  });
  page.drawText("Naqsh jamoasi", {
    x: rightX, y: 92, size: 12, font: bold, color: darkInk,
  });
  page.drawLine({
    start: { x: rightX, y: 85 },
    end: { x: rightX + 170, y: 85 },
    thickness: 1,
    color: textMuted,
  });

  const codeText = `Sertifikat ID: ${data.certCode}`;
  page.drawText(codeText, {
    x: 70, y: 50, size: 10, font: bold, color: borderNavy,
  });

  const verifyUrl = `https://academy.mirzo.uz/shahodatnoma/${data.certCode}`;
  const verifyText = `Haqiqiyligini tekshirish: ${verifyUrl}`;
  const verifyWidth = regular.widthOfTextAtSize(verifyText, 9);
  page.drawText(verifyText, {
    x: width - verifyWidth - 70, y: 50, size: 9, font: regular, color: textMuted,
  });
}
