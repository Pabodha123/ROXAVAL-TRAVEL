const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const env = require('../config/env');
const { t } = require('../i18n/strings');
const { formatDate } = require('./dateFormat');

const BRAND_COLOR = '#0f766e';
const TEXT_COLOR = '#1f2937';
const MUTED_COLOR = '#6b7280';

/**
 * Draws the shared header (logo + company details) used on every
 * generated document type.
 */
function drawHeader(doc, title) {
  const logoPath = path.resolve(process.cwd(), env.COMPANY.logoPath);
  const startY = 40;

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, startY, { width: 60 });
  }

  doc
    .fillColor(TEXT_COLOR)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(env.COMPANY.name, 110, startY, { continued: false });

  doc
    .fillColor(MUTED_COLOR)
    .fontSize(9)
    .font('Helvetica')
    .text(env.COMPANY.address, 110, startY + 20)
    .text(`${env.COMPANY.phone}  |  ${env.COMPANY.email}`, 110, startY + 33)
    .text(env.COMPANY.website, 110, startY + 46);

  doc
    .fillColor(BRAND_COLOR)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(title, 0, startY, { align: 'right' });

  doc.moveTo(40, 105).lineTo(555, 105).strokeColor('#e5e7eb').stroke();
  doc.moveDown(3);
}

function drawFooter(doc, s) {
  const bottom = doc.page.height - 50;
  doc
    .fontSize(8)
    .fillColor(MUTED_COLOR)
    .text(
      `${env.COMPANY.name} \u2022 ${env.COMPANY.website} \u2022 ${s.generatedOn} ${formatDate(new Date())}`,
      40,
      bottom,
      { align: 'center', width: 515 }
    );
}

function drawKeyValueBlock(doc, x, y, pairs) {
  let cursorY = y;
  pairs.forEach(([label, value]) => {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_COLOR).text(`${label}: `, x, cursorY, { continued: true });
    doc.font('Helvetica').fillColor(MUTED_COLOR).text(`${value ?? '-'}`);
    cursorY = doc.y + 2;
  });
  return cursorY;
}

function drawTable(doc, { x, y, columns, rows }) {
  let cursorY = y;
  const rowHeight = 22;

  doc.rect(x, cursorY, columns.reduce((s, c) => s + c.width, 0), rowHeight).fill('#f0fdfa');
  let cursorX = x;
  doc.fillColor(TEXT_COLOR).font('Helvetica-Bold').fontSize(9);
  columns.forEach((col) => {
    doc.text(col.label, cursorX + 5, cursorY + 6, { width: col.width - 10 });
    cursorX += col.width;
  });
  cursorY += rowHeight;

  doc.font('Helvetica').fontSize(9).fillColor(TEXT_COLOR);
  rows.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.rect(x, cursorY, columns.reduce((s, c) => s + c.width, 0), rowHeight).fill('#f9fafb');
      doc.fillColor(TEXT_COLOR);
    }
    cursorX = x;
    columns.forEach((col) => {
      doc.text(String(row[col.key] ?? '-'), cursorX + 5, cursorY + 6, { width: col.width - 10 });
      cursorX += col.width;
    });
    cursorY += rowHeight;
  });

  return cursorY + 10;
}

/**
 * Generic document builder. `type` controls the title/layout tweaks while
 * `data` supplies the content. Returns the absolute file path written.
 *
 * Supported types: itinerary | hotel_voucher | booking_confirmation |
 *                   invoice | payment_receipt | quotation
 */
async function generatePdfDocument(type, data, outputFileName, lang = 'en') {
  const s = t(lang, 'pdf');
  const titles = {
    itinerary: s.itinerary,
    hotel_voucher: s.hotelVoucher,
    booking_confirmation: s.bookingConfirmation,
    invoice: s.invoice,
    payment_receipt: s.paymentReceipt,
    quotation: s.quotation,
  };

  const outputDir = path.resolve(process.cwd(), env.UPLOADS.documentsDir);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, outputFileName);

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  drawHeader(doc, titles[type] || 'Document');

  // Customer / booking summary block
  const summaryPairs = [
    [s.referenceNumber, data.referenceNumber],
    [s.customerName, data.customerName],
    [s.email, data.customerEmail],
    [s.phone, data.customerPhone],
    [s.dateIssued, formatDate(new Date())],
  ];
  if (data.packageName) summaryPairs.push([s.package, data.packageName]);
  if (data.travelDate) summaryPairs.push([s.travelDate, data.travelDate]);
  if (data.hotelName) summaryPairs.push([s.hotel, data.hotelName]);

  let y = drawKeyValueBlock(doc, 40, doc.y, summaryPairs);
  y += 10;

  // Line items (itinerary days, invoice line items, etc.)
  if (Array.isArray(data.tableRows) && data.tableColumns) {
    y = drawTable(doc, { x: 40, y, columns: data.tableColumns, rows: data.tableRows });
  }

  // Free-form notes / terms
  if (data.notes) {
    doc.font('Helvetica-Bold').fontSize(10).fillColor(TEXT_COLOR).text(s.notes, 40, y + 5);
    doc.font('Helvetica').fontSize(9).fillColor(MUTED_COLOR).text(data.notes, 40, doc.y + 3, { width: 515 });
  }

  // Amount summary (invoices, receipts, quotations)
  if (data.amountSummary) {
    const startY = doc.y + 20;
    let ay = startY;
    Object.entries(data.amountSummary).forEach(([label, value]) => {
      doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR).text(label, 350, ay, { continued: true, width: 100 });
      doc.font('Helvetica-Bold').text(`  ${value}`, { align: 'right' });
      ay = doc.y + 4;
    });
  }

  drawFooter(doc, s);
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}

module.exports = { generatePdfDocument };
