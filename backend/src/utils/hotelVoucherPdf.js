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
    .text(`WhatsApp (SL): ${env.COMPANY.phone}  |  WhatsApp (UAE): ${env.COMPANY.phoneUAE}`, 105, startY + 30)
    .text(`${env.COMPANY.email}  |  ${env.COMPANY.website}`, 105, startY + 42);

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

/**
 * Bordered, titled details block — a dark brand-colored header bar over a
 * grid of label/value cells, matching the "Enquiry Details"-style table
 * hotel partners are used to seeing from Roxaval (see the reference booking
 * request format). Each entry in `rows` is an array of [label, value] pairs
 * rendered as evenly-split columns within that row.
 */
function drawDetailsTable(doc, { x, y, width, title, rows }) {
  const headerHeight = 20;
  doc.rect(x, y, width, headerHeight).fill(BRAND_COLOR);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text(title.toUpperCase(), x + 8, y + 6);
  let cursorY = y + headerHeight;
  const rowHeight = 28;

  rows.forEach((cells, idx) => {
    const bg = idx % 2 === 1 ? '#f0fdfa' : '#ffffff';
    doc.rect(x, cursorY, width, rowHeight).fill(bg);
    const colWidth = width / cells.length;
    cells.forEach(([label, value], i) => {
      const cx = x + i * colWidth;
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(MUTED_COLOR).text(label.toUpperCase(), cx + 8, cursorY + 6, { width: colWidth - 16 });
      doc.font('Helvetica').fontSize(9.5).fillColor(TEXT_COLOR).text(String(value ?? '-'), cx + 8, cursorY + 16, { width: colWidth - 16 });
    });
    cursorY += rowHeight;
  });

  doc.rect(x, y, width, cursorY - y).strokeColor('#e5e7eb').lineWidth(0.75).stroke();
  return cursorY + 14;
}

/**
 * Branded sign-off panel — logo, wordmark, licence line and contact
 * details on a dark card, echoing the email-signature format hotel
 * partners already receive from Roxaval so the voucher closes the same way.
 */
function drawBrandFooterPanel(doc, y) {
  const x = 40;
  const width = PAGE_WIDTH;
  const height = 66;
  doc.rect(x, y, width, height).fill('#0d3b36');

  const logoPath = path.resolve(process.cwd(), env.COMPANY.logoPath);
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, x + 14, y + 13, { width: 40, height: 40 });
  }

  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(13).text('ROXAVAL TRAVELS', x + 64, y + 12);
  doc.fillColor(GOLD_COLOR).font('Helvetica-Bold').fontSize(7).text('SLTDA AUTHORIZED TRAVEL AGENT', x + 64, y + 27);
  doc
    .fillColor('#d1d5db')
    .font('Helvetica')
    .fontSize(7.5)
    .text(`WhatsApp (SL): ${env.COMPANY.phone}   |   WhatsApp (UAE): ${env.COMPANY.phoneUAE}   |   ${env.COMPANY.email}`, x + 64, y + 40)
    .text(`${env.COMPANY.address}   |   ${env.COMPANY.website}`, x + 64, y + 51);

  return y + height + 12;
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
 * populated where needed by the caller) and resolves with the finished file
 * as an in-memory Buffer. Callers are responsible for storing it (Cloudinary)
 * — nothing here touches local disk, since the serverless host's filesystem
 * doesn't persist between invocations.
 */
async function generateHotelVoucherPdf(voucher, lang = 'en') {
  const s = t(lang, 'pdf');

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const finished = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  drawHeader(doc, s);

  // Greeting — the voucher doubles as the booking-request format hotel
  // partners already recognize from Roxaval's emails, so it opens the same way.
  doc.font('Helvetica').fontSize(9.5).fillColor(TEXT_COLOR);
  doc.text(s.greetingSalutation, 40, doc.y);
  doc.text(s.greetingIntro, 40, doc.y + 2);
  doc.fillColor(MUTED_COLOR).fontSize(9).text(s.greetingRequest, 40, doc.y + 4, { width: PAGE_WIDTH });
  doc.y += 10;

  // Voucher / booking details — bordered table with a branded header bar,
  // mirroring the booking-request format hotel partners already recognize.
  const guestSummary = `${voucher.guests.adults} Adult${voucher.guests.adults === 1 ? '' : 's'}${
    voucher.guests.children ? `, ${voucher.guests.children} Child${voucher.guests.children === 1 ? '' : 'ren'}` : ''
  }${voucher.guests.infants ? `, ${voucher.guests.infants} Infant${voucher.guests.infants === 1 ? '' : 's'}` : ''}`;

  const detailsY = drawDetailsTable(doc, {
    x: 40,
    y: doc.y,
    width: PAGE_WIDTH,
    title: s.voucherDetails || 'Voucher Details',
    rows: [
      [[s.guestName, voucher.customerName], [s.voucherNo, voucher.voucherNumber]],
      [[s.bookingRef, voucher.bookingReference], [s.tourReference, voucher.tourReferenceNumber || '-']],
      [[s.guests, guestSummary], [s.emergencyContact, voucher.emergencyContact || voucher.customerPhone || '-']],
      [
        [s.package, voucher.tourPackageName || '-'],
        [s.travelDates, `${voucher.tourStartDate ? formatDate(voucher.tourStartDate) : '-'} - ${voucher.tourEndDate ? formatDate(voucher.tourEndDate) : '-'}`],
      ],
    ],
  });
  doc.y = detailsY;

  // Hotel block — location/contact are always labeled and shown (falling
  // back to '-') so a hotel record missing them is obvious at a glance,
  // rather than the line just silently disappearing.
  const hotel = voucher.hotelSnapshot;
  drawStars(doc, 40, doc.y, hotel.starRating || 0);
  doc.y += 20;
  doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT_COLOR).text(hotel.name || '-', 40, doc.y);
  doc.y += 18;
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor(MUTED_COLOR)
    .text(`${s.location.toUpperCase()}:  `, 40, doc.y, { continued: true })
    .font('Helvetica')
    .fillColor(TEXT_COLOR)
    .text(hotel.address || '-');
  doc.y += 12;
  const hotelContact = `${hotel.contactPhone || '-'}${hotel.contactEmail ? `  |  ${hotel.contactEmail}` : ''}`;
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor(MUTED_COLOR)
    .text(`${s.contact.toUpperCase()}:  `, 40, doc.y, { continued: true })
    .font('Helvetica')
    .fillColor(TEXT_COLOR)
    .text(hotelContact);
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

  // Cost — always shown (with a '-' fallback) rather than only when a rate
  // has been entered, so this section is never silently missing.
  doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR).text(s.ratePerNight, 350, doc.y, { continued: true, width: 100 });
  doc.font('Helvetica-Bold').text(`  ${voucher.ratePerNight ? `${voucher.ratePerNight.toLocaleString()} USD` : '-'}`, { align: 'right' });
  doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND_COLOR).text(s.grandTotal, 350, doc.y + 6, { continued: true, width: 100 });
  doc.text(`  ${voucher.ratePerNight ? `${(voucher.totalAmount || 0).toLocaleString()} USD` : '-'}`, { align: 'right' });
  doc.y += 26;

  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED_COLOR).text(`${s.confirmationNote} ${s.lookingForward}`, 40, doc.y + 6, { width: 515 });
  doc.y += 32;

  doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_COLOR).text(s.signOff, 40, doc.y);
  doc.text(s.hotelBookingsTeam, 40, doc.y + 13);
  doc.y += 34;

  // Signature + stamp + QR, flowing with the rest of the content instead of
  // being pinned to the page bottom (that anchoring previously stranded the
  // final line alone on a blank page 2 whenever it landed too close to the
  // margin — see drawBrandFooterPanel's own note below for the same class
  // of fix applied there).
  const footerY = doc.y + 10;
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

  doc.y = footerY + 26;
  doc.y = drawBrandFooterPanel(doc, doc.y);

  doc
    .fontSize(7)
    .fillColor(MUTED_COLOR)
    .text(`${env.COMPANY.name} • ${env.COMPANY.website} • ${s.generatedOn} ${formatDate(new Date())}`, 40, doc.y, {
      align: 'center',
      width: 515,
    });

  doc.end();

  return finished;
}

module.exports = { generateHotelVoucherPdf };
