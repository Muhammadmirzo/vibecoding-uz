import { PDFDocument, StandardFonts } from "pdf-lib";
import type { GenerateCertificateInput } from "@/lib/validations";
import { renderCertificateTemplate } from "./render";
import { prepareCertificateTemplate } from "./template";

/** Generates an elegant PDF certificate buffer using pdf-lib. */
export async function generateCertificatePdf(input: GenerateCertificateInput): Promise<Buffer> {
  const template = prepareCertificateTemplate(input);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    title: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
  };

  renderCertificateTemplate(page, width, height, template, fonts);
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
