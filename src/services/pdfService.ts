import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { PDFDocument, rgb, StandardFonts, PDFImage } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import { saveAs } from 'file-saver';
import { GoogleGenAI } from "@google/genai";
import heic2any from 'heic2any';
import mammoth from 'mammoth';

// Worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ✅ FIX env (Vite)
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export class PDFService {

  // ✅ HELPER GLOBAL (ANTI ERROR Blob)
  private static toBlob(data: Uint8Array | ArrayBufferLike, type: string): Blob {
  const buffer = data instanceof Uint8Array
    ? new Uint8Array(data).buffer
    : new Uint8Array(data).buffer;

  return new Blob([buffer as ArrayBuffer], { type });
}

  private static sanitizeText(text: string): string {
    if (!text) return "";

    const replacements: Record<string, string> = {
      '≈': '~=',
      '≠': '!=',
      '≤': '<=',
      '≥': '>=',
      '→': '->',
      '←': '<-',
      '—': '-',
      '–': '-',
      '…': '...',
      '´': "'",
      '’': "'",
      '‘': "'",
      '”': '"',
      '“': '"',
    };

    let sanitized = text;
    Object.entries(replacements).forEach(([k, v]) => {
      sanitized = sanitized.replaceAll(k, v);
    });

    return sanitized.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, "?");
  }

  /**
   * PDF TO X
   */
  static async convertToImages(file: File, format: 'jpg' | 'png'): Promise<Blob[]> {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const images: Blob[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({canvasContext: ctx,viewport,canvas}).promise;

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), `image/${format === 'jpg' ? 'jpeg' : 'png'}`, 0.9)
      );

      images.push(blob);
    }

    return images;
  }

  static async extractText(file: File): Promise<string[]> {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const result: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');

      result.push(text);
    }

    return result;
  }

  static async convertToWord(file: File): Promise<Blob> {
    const texts = await this.extractText(file);

    const doc = new Document({
      sections: [{
        children: texts.map(t =>
          new Paragraph({
            children: [new TextRun(t)],
          })
        ),
      }],
    });

    return Packer.toBlob(doc);
  }

  static async convertToExcel(file: File): Promise<Blob> {
    const texts = await this.extractText(file);

    const ws = XLSX.utils.json_to_sheet(
      texts.map((t, i) => ({ Page: i + 1, Content: t }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Content");

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // ✅ FIX
    return this.toBlob(out, 'application/octet-stream');
  }

  static async convertToPPT(file: File): Promise<Blob> {
    const texts = await this.extractText(file);
    const ppt = new PptxGenJS();

    texts.forEach((t, i) => {
      const slide = ppt.addSlide();
      slide.addText(`Page ${i + 1}`, { x: 0.5, y: 0.5, fontSize: 18 });
      slide.addText(t.slice(0, 1000), { x: 0.5, y: 1.5, fontSize: 12 });
    });

    return (await ppt.write({ outputType: 'blob' })) as Blob;
  }

  /**
   * X TO PDF
   */
  static async imagesToPdf(files: File | File[]): Promise<Blob> {
    const list = Array.isArray(files) ? files : [files];
    const pdfDoc = await PDFDocument.create();

    for (const file of list) {
      const bytes = await file.arrayBuffer();
      let image: PDFImage | undefined;

      if (file.type.includes('jpeg') || file.name.endsWith('.jpg')) {
        image = await pdfDoc.embedJpg(bytes);
      } else if (file.type.includes('png')) {
        image = await pdfDoc.embedPng(bytes);
      } else if (file.name.endsWith('.heic')) {
        const converted = await heic2any({ blob: new Blob([bytes]), toType: 'image/jpeg' });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        image = await pdfDoc.embedJpg(await blob.arrayBuffer());
      }

      if (!image) continue;

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    return this.toBlob(await pdfDoc.save(), 'application/pdf');
  }

  static async docxToPdf(file: File): Promise<Blob> {
    const buffer = await file.arrayBuffer();

    const header = new Uint8Array(buffer.slice(0, 2));
    const isZip = header[0] === 0x50 && header[1] === 0x4B;

    if (!isZip) {
      throw new Error("Gunakan file .docx, bukan .doc lama");
    }

    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = this.sanitizeText(result.value);

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let page = pdf.addPage();
    let y = page.getHeight() - 50;

    for (const line of text.split('\n')) {
      if (y < 50) {
        page = pdf.addPage();
        y = page.getHeight() - 50;
      }

      page.drawText(line.slice(0, 500), {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });

      y -= 16;
    }

    return this.toBlob(await pdf.save(), 'application/pdf');
  }

  static async excelToPdf(file: File): Promise<Blob> {
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const text = this.sanitizeText(XLSX.utils.sheet_to_csv(sheet));

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let page = pdf.addPage();
    let y = page.getHeight() - 50;

    for (const line of text.split('\n')) {
      if (y < 50) {
        page = pdf.addPage();
        y = page.getHeight() - 50;
      }

      page.drawText(line.slice(0, 500), { x: 50, y, size: 8, font });
      y -= 12;
    }

    return this.toBlob(await pdf.save(), 'application/pdf');
  }

  static async txtToPdf(file: File): Promise<Blob> {
    const text = this.sanitizeText(await file.text());

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let page = pdf.addPage();
    let y = page.getHeight() - 50;

    for (const line of text.split('\n')) {
      if (y < 50) {
        page = pdf.addPage();
        y = page.getHeight() - 50;
      }

      page.drawText(line.slice(0, 500), { x: 50, y, size: 10, font });
      y -= 14;
    }

    return this.toBlob(await pdf.save(), 'application/pdf');
  }

  static async process(file: File, toolId: string): Promise<void> {
    const name = file.name.replace(/\.[^/.]+$/, "");

    try {
      switch (toolId) {

        case 'pdf-to-word':
        case 'pdf-to-docx':
          return saveAs(await this.convertToWord(file), `${name}.docx`);

        case 'pdf-to-jpg':
          return (await this.convertToImages(file, 'jpg'))
            .forEach((b, i) => saveAs(b, `${name}_${i + 1}.jpg`));

        case 'pdf-to-excel':
          return saveAs(await this.convertToExcel(file), `${name}.xlsx`);

        case 'pdf-to-ppt':
          return saveAs(await this.convertToPPT(file), `${name}.pptx`);

        case 'jpg-to-pdf':
        case 'png-to-pdf':
        case 'heic-to-pdf':
          return saveAs(await this.imagesToPdf(file), `${name}.pdf`);

        case 'docx-to-pdf':
          return saveAs(await this.docxToPdf(file), `${name}.pdf`);

        case 'excel-to-pdf':
          return saveAs(await this.excelToPdf(file), `${name}.pdf`);

        case 'txt-to-pdf':
          return saveAs(await this.txtToPdf(file), `${name}.pdf`);

        default: {
          const pdf = await PDFDocument.create();
          const page = pdf.addPage();
          page.drawText(`Tool belum tersedia: ${toolId}`, { x: 50, y: 700 });

          return saveAs(this.toBlob(await pdf.save(), 'application/pdf'), `${name}.pdf`);
        }
      }

    } catch (err) {
      console.error('PDFService error:', err);
      throw err;
    }
  }
}