const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const env = require('../config/env');
const { t } = require('../i18n/strings');
const { formatDate } = require('./dateFormat');

const BRAND_COLOR = '#0f766e';
const GOLD_COLOR = '#c8a24c';
const TEXT_COLOR = '#1f2937';
const MUTED_COLOR = '#6b7280';
const PAGE_WIDTH = 515; // usable width at margin 40 on A4

function drawHeader(doc, s) {
  const logoPath = path.resolve(process.cwd(), env.COMPANY.logoPath);
  const startY = 40;

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, startY, { width: 55 });
  }

  doc.fillColor(TEXT_COLOR).font('Helvetica-Bold').fontSize(15).text(env.COMPANY.name, 105, startY);
  doc
    .fillColor(MUTED_COLOR)
    .font('Helvetica')
    .fontSize(8)
    .text(env.COMPANY.address, 105, startY + 18)
    .text(`${env.COMPANY.phone}  |  ${env.COMPANY.email}`, 105, startY + 30)
    .text(env.COMPANY.website, 105, startY + 42);

  doc.fillColor(BRAND_COLOR).font('Helvetica-Bold').fontSize(18).text(s.hotelVoucher, 0, startY, { align: 'right' });

  doc.moveTo(40, 95).lineTo(555, 95).strokeColor('#e5e7eb').stroke();
  doc.y = 108;
}

/** Draws a 5-star row starting at (x, y); filled stars use GOLD_COLOR, the rest are outlined. */
function drawStars(doc, x, y, rating = 0) {
  const points = 5;
  const outerR = 6;
  const innerR = 2.6;
  const gap = 16;

  for (let i = 0; i < points; i += 1) {
    const cx = x + i * gap + outerR;
    const cy = y + outerR;
    const vertices = [];
    for (let p = 0; p < 10; p += 1) {
      const r = p % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / 5) * p - Math.PI / 2;
      vertices.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    doc.polygon(...vertices);
    if (i < rating) {
      doc.fillColor(GOLD_COLOR).fill();
    } else {
      doc.strokeColor('#d1d5db').lineWidth(0.75).stroke();
    }
  }
}

function keyValueRow(doc, x, y, pairs, colWidth) {
  let cursorX = x;
  pairs.forEach(([label, value]) => {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED_COLOR).text(label.toUpperCase(), cursorX, y);
    doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR).text(String(value ?? '-'), cursorX, y + 12, { width: colWidth - 10 });
    cursorX += colWidth;
  });
}

function drawTable(doc, { x, y, columns, rows }) {
  let cursorY = y;
  const rowHeight = 26;
  const totalWidth = columns.reduce((s, c) => s + c.width, 0);

  doc.rect(x, cursorY, totalWidth, rowHeight).fill(BRAND_COLOR);
  let cursorX = x;
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
  columns.forEach((col) => {
    doc.text(col.label.toUpperCase(), cursorX + 6, cursorY + 9, { width: col.width - 10 });
    cursorX += col.width;
  });
  cursorY += rowHeight;

  doc.font('Helvetica').fontSize(9);
  rows.forEach((row, idx) => {
    const bg = idx % 2 === 1 ? '#f0fdfa' : '#ffffff';
    doc.rect(x, cursorY, totalWidth, rowHeight).fill(bg);
    cursorX = x;
    doc.fillColor(TEXT_COLOR);
    columns.forEach((col) => {
      doc.text(String(row[col.key] ?? '-'), cursorX + 6, cursorY + 9, { width: col.width - 10 });
      cursorX += col.width;
    });
    cursorY += rowHeight;
  });

  doc.rect(x, y, totalWidth, cursorY - y).strokeColor('#e5e7eb').lineWidth(0.75).stroke();
  return cursorY + 14;
}

/**
 * Renders a single hotel voucher PDF from a HotelVoucher document (already
 * populated where needed by the caller) and returns the absolute file path.
 */
async function generateHotelVoucherPdf(voucher, outputFileName, lang = 'en') {
  const s = t(lang, 'pdf');
  const outputDir = path.resolve(process.cwd(), env.UPLOADS.documentsDir);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, outputFileName);

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  drawHeader(doc, s);

  // Meta bar
  keyValueRow(
    doc,
    40,
    doc.y + 6,
    [
      [s.voucherNo, voucher.voucherNumber],
      [s.bookingRef, voucher.bookingReference],
      [s.tourReference, voucher.tourReferenceNumber || '-'],
      [s.dateIssued, formatDate(new Date())],
    ],
    PAGE_WIDTH / 4
  );
  doc.y += 36;

  // Guest & tour block
  const guestSummary = `${voucher.guests.adults} Adult${voucher.guests.adults === 1 ? '' : 's'}${
    voucher.guests.children ? `, ${voucher.guests.children} Child${voucher.guests.children === 1 ? '' : 'ren'}` : ''
  }${voucher.guests.infants ? `, ${voucher.guests.infants} Infant${voucher.guests.infants === 1 ? '' : 's'}` : ''}`;

  keyValueRow(
    doc,
    40,
    doc.y,
    [
      [s.guestName, voucher.customerName],
      [s.guests, guestSummary],
      [s.emergencyContact, voucher.emergencyContact || voucher.customerPhone || '-'],
    ],
    PAGE_WIDTH / 3
  );
  doc.y += 32;

  keyValueRow(
    doc,
    40,
    doc.y,
    [
      [s.package, voucher.tourPackageName || '-'],
      [s.tourStart, voucher.tourStartDate ? formatDate(voucher.tourStartDate) : '-'],
      [s.tourEnd, voucher.tourEndDate ? formatDate(voucher.tourEndDate) : '-'],
    ],
    PAGE_WIDTH / 3
  );
  doc.y += 34;

  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e5e7eb').stroke();
  doc.y += 14;

  // Hotel block
  const hotel = voucher.hotelSnapshot;
  drawStars(doc, 40, doc.y, hotel.starRating || 0);
  doc.y += 20;
  doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT_COLOR).text(hotel.name || '-', 40, doc.y);
  doc.font('Helvetica').fontSize(9).fillColor(MUTED_COLOR).text(hotel.address || '', 40, doc.y + 4, { width: 515 });
  if (hotel.contactPhone || hotel.contactEmail) {
    doc.text(`${hotel.contactPhone || ''}${hotel.contactPhone && hotel.contactEmail ? '  |  ' : ''}${hotel.contactEmail || ''}`, 40, doc.y + 4);
  }
  doc.y += 14;

  // Stay details table
  const tableY = drawTable(doc, {
    x: 40,
    y: doc.y,
    columns: [
      { key: 'checkIn', label: s.checkIn, width: 75 },
      { key: 'checkOut', label: s.checkOut, width: 75 },
      { key: 'nights', label: s.nights, width: 45 },
      { key: 'roomType', label: s.roomType, width: 140 },
      { key: 'rooms', label: 'Rooms', width: 45 },
      { key: 'mealPlan', label: s.mealPlan, width: 65 },
      { key: 'times', label: 'Arr / Dep', width: 70 },
    ],
    rows: [
      {
        checkIn: formatDate(voucher.checkInDate),
        checkOut: formatDate(voucher.checkOutDate),
        nights: voucher.nights,
        roomType: voucher.roomType || s.standard,
        rooms: voucher.numberOfRooms,
        mealPlan: voucher.mealPlan,
        times: `${voucher.arrivalTime || '-'} / ${voucher.departureTime || '-'}`,
      },
    ],
  });
  doc.y = tableY;

  if (voucher.specialRequests) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_COLOR).text(s.specialRequests, 40, doc.y);
    doc.font('Helvetica').fontSize(9).fillColor(MUTED_COLOR).text(voucher.specialRequests, 40, doc.y + 12, { width: 515 });
    doc.y += 34;
  }

  if (voucher.ratePerNight) {
    doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR).text(s.ratePerNight, 350, doc.y, { continued: true, width: 100 });
    doc.font('Helvetica-Bold').text(`  ${voucher.ratePerNight.toLocaleString()} USD`, { align: 'right' });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_COLOR).text(s.grandTotal, 350, doc.y + 6, { continued: true, width: 100 });
    doc.text(`  ${(voucher.totalAmount || 0).toLocaleString()} USD`, { align: 'right' });
    doc.y += 26;
  }

  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED_COLOR).text(
    s.confirmationNote,
    40,
    doc.y + 6,
    { width: 515 }
  );
  doc.y += 34;

  // Footer: signature + stamp + QR
  const footerY = Math.max(doc.y, doc.page.height - 170);
  doc.moveTo(40, footerY).lineTo(295, footerY).strokeColor('#9ca3af').stroke();
  doc.font('Helvetica').fontSize(8).fillColor(MUTED_COLOR).text(s.authorizedSignature, 40, footerY + 4);

  doc.rect(320, footerY - 40, 130, 60).strokeColor('#9ca3af').dash(2, { space: 2 }).stroke();
  doc.undash();
  doc.font('Helvetica').fontSize(8).fillColor(MUTED_COLOR).text(s.hotelConfirmationStamp, 320, footerY + 4);

  const qrText = `Voucher:${voucher.voucherNumber}|Booking:${voucher.bookingReference}|Hotel:${hotel.name}|CheckIn:${new Date(
    voucher.checkInDate
  ).toDateString()}|CheckOut:${new Date(voucher.checkOutDate).toDateString()}`;
  const qrBuffer = await QRCode.toBuffer(qrText, { type: 'png', margin: 1, width: 90 });
  doc.image(qrBuffer, 465, footerY - 50, { width: 60 });

  doc
    .fontSize(7)
    .fillColor(MUTED_COLOR)
    .text(`${env.COMPANY.name} • ${env.COMPANY.website} • ${s.generatedOn} ${formatDate(new Date())}`, 40, doc.page.height - 40, {
      align: 'center',
      width: 515,
    });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}

module.exports = { generateHotelVoucherPdf };
