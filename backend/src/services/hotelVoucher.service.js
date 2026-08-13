const { Booking, HotelVoucher, Document, Customer } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateHotelVoucherPdf } = require('../utils/hotelVoucherPdf');
const { uploadBuffer } = require('../config/cloudinary');
const { hotelVoucherEmail } = require('../utils/emailTemplates');
const { sendEmail } = require('../utils/email');

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const deriveMealPlan = (mealsSet) => {
  const has = (m) => mealsSet.has(m);
  if (has('Breakfast') && has('Lunch') && has('Dinner')) return 'FB';
  if (has('Breakfast') && has('Dinner')) return 'HB';
  if (has('Breakfast')) return 'BB';
  return 'Room Only';
};

/**
 * Groups an ordered list of itinerary days into consecutive same-hotel
 * stays. Each `day` needs `dayNumber`, a populated `hotel` (or null/
 * undefined), and `meals` (string array). A day with no hotel breaks any
 * run in progress (e.g. an arrival/departure day) rather than merging
 * across it. Works identically for `Itinerary.days` and
 * `TourPackage.itinerary` — both share this shape.
 */
const groupHotelStays = (days, tripStartDate) => {
  const sorted = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  const stays = [];
  let current = null;

  sorted.forEach((day) => {
    const hotelId = day.hotel?._id?.toString();
    if (!hotelId) {
      current = null;
      return;
    }
    if (current && current.hotelId === hotelId && day.dayNumber === current.endDay + 1) {
      current.endDay = day.dayNumber;
      (day.meals || []).forEach((m) => current.meals.add(m));
    } else {
      current = { hotelId, hotel: day.hotel, startDay: day.dayNumber, endDay: day.dayNumber, meals: new Set(day.meals || []) };
      stays.push(current);
    }
  });

  return stays.map((s, idx) => {
    const nights = s.endDay - s.startDay + 1;
    const checkInDate = addDays(tripStartDate, s.startDay - 1);
    const checkOutDate = addDays(checkInDate, nights);
    return {
      sequence: idx + 1,
      hotel: s.hotel,
      startDay: s.startDay,
      endDay: s.endDay,
      nights,
      checkInDate,
      checkOutDate,
      mealPlan: deriveMealPlan(s.meals),
    };
  });
};

const loadBookingContext = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate({ path: 'customer', populate: { path: 'user', select: 'fullName email phone' } })
    .populate({ path: 'tourPackage', populate: [{ path: 'itinerary.hotel' }] })
    .populate({
      path: 'itinerary',
      populate: [{ path: 'days.hotel' }, { path: 'customTourRequest', select: 'referenceNumber' }],
    });
  if (!booking) throw ApiError.notFound('Booking not found.');
  return booking;
};

const renderAndSavePdf = async (voucher, adminId) => {
  const fileName = `voucher-${voucher.voucherNumber}-${Date.now()}.pdf`;
  const customer = await Customer.findById(voucher.customer).select('preferredLanguage');
  const buffer = await generateHotelVoucherPdf(voucher, customer?.preferredLanguage || 'en');
  // 'raw' (not 'auto'/'image') — Cloudinary blocks direct delivery of PDFs
  // uploaded as an image resource by default (anti-abuse policy). It also
  // blocks delivery of *any* asset whose public_id ends in .pdf regardless
  // of resource_type, so the extension is stripped from the id here; the
  // human-readable `fileName` (with .pdf) is kept separately for display,
  // download, and email-attachment naming.
  const uploaded = await uploadBuffer(buffer, { folder: 'documents', resourceType: 'raw', publicId: fileName.replace(/\.pdf$/i, '') });
  const fileUrl = uploaded.secure_url;

  if (voucher.document) {
    await Document.findByIdAndUpdate(voucher.document, { fileUrl, fileName });
  } else {
    const document = await Document.create({
      type: 'hotel_voucher',
      referenceNumber: voucher.voucherNumber,
      booking: voucher.booking,
      customer: voucher.customer,
      hotel: voucher.hotel,
      fileUrl,
      fileName,
      generatedBy: adminId,
    });
    voucher.document = document._id;
  }
};

/**
 * Reads the confirmed booking's itinerary day-by-day, groups it into hotel
 * stays, and creates one voucher per stay — superseding any vouchers from a
 * prior generation of this booking first, so history is preserved.
 */
const generateVouchersForBooking = async (bookingId, adminId) => {
  const booking = await loadBookingContext(bookingId);
  if (!['Confirmed', 'Completed'].includes(booking.status)) {
    throw ApiError.badRequest(`Hotel vouchers can only be generated once a booking is Confirmed (current status: '${booking.status}').`);
  }

  const days = booking.sourceType === 'customized' ? booking.itinerary?.days || [] : booking.tourPackage?.itinerary || [];
  const stays = groupHotelStays(days, booking.travelDate);
  if (!stays.length) {
    throw ApiError.badRequest("No hotel stays found in this booking's itinerary to generate vouchers for.");
  }

  await HotelVoucher.updateMany({ booking: booking._id, status: { $ne: 'Superseded' } }, { status: 'Superseded' });

  const customerUser = booking.customer.user;
  const tourReferenceNumber =
    booking.sourceType === 'customized' ? booking.itinerary?.customTourRequest?.referenceNumber || '' : booking.bookingReference;
  const tourPackageName = booking.sourceType === 'package' ? booking.tourPackage?.name?.en : booking.itinerary?.title;
  const lastDayNumber = days.reduce((max, d) => Math.max(max, d.dayNumber), 1);
  const tourEndDate = booking.returnDate || addDays(booking.travelDate, lastDayNumber - 1);

  const created = [];
  for (const stay of stays) {
    const voucherNumber = `HV-${booking.bookingReference}-${String(stay.sequence).padStart(2, '0')}`;
    const voucher = new HotelVoucher({
      voucherNumber,
      booking: booking._id,
      customer: booking.customer._id,
      hotel: stay.hotel._id,
      sequence: stay.sequence,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      nights: stay.nights,
      mealPlan: stay.mealPlan,
      numberOfRooms: 1,
      customerName: customerUser.fullName,
      customerEmail: customerUser.email,
      customerPhone: customerUser.phone,
      guests: booking.travelers,
      tourPackageName,
      tourStartDate: booking.travelDate,
      tourEndDate,
      tourReferenceNumber,
      bookingReference: booking.bookingReference,
      emergencyContact: customerUser.phone,
      hotelSnapshot: {
        name: stay.hotel.name?.en || '',
        address: stay.hotel.address?.en || '',
        contactPhone: stay.hotel.contactPhone,
        contactEmail: stay.hotel.contactEmail,
        starRating: stay.hotel.starRating,
      },
      status: 'Draft',
      generatedBy: adminId,
    });

    // Save as Draft first so a duplicate/validation error surfaces before
    // any PDF file or Document row is created.
    // eslint-disable-next-line no-await-in-loop
    await voucher.save();
    // eslint-disable-next-line no-await-in-loop
    await renderAndSavePdf(voucher, adminId);
    voucher.status = 'Generated';
    // eslint-disable-next-line no-await-in-loop
    await voucher.save();
    created.push(voucher);
  }

  // No customer-facing notification/email here on purpose: hotel vouchers
  // are an internal/operational document (see getMyDocuments in
  // document.controller.js) — the customer only hears about one if and
  // when an admin explicitly uses Email Customer on it.

  return created;
};

const EDITABLE_FIELDS = [
  'roomType',
  'numberOfRooms',
  'mealPlan',
  'ratePerNight',
  'specialRequests',
  'arrivalTime',
  'departureTime',
  'emergencyContact',
];

const updateVoucher = async (voucherId, adminId, patch) => {
  const voucher = await HotelVoucher.findById(voucherId);
  if (!voucher) throw ApiError.notFound('Hotel voucher not found.');
  if (voucher.status === 'Superseded') {
    throw ApiError.badRequest('This voucher has been superseded. Regenerate vouchers for the booking to create a current one.');
  }

  EDITABLE_FIELDS.forEach((field) => {
    if (patch[field] !== undefined) voucher[field] = patch[field];
  });
  voucher.totalAmount = voucher.ratePerNight != null ? voucher.ratePerNight * voucher.nights * voucher.numberOfRooms : undefined;

  await renderAndSavePdf(voucher, adminId);
  if (voucher.status === 'Draft') voucher.status = 'Generated';
  await voucher.save();
  return voucher;
};

/**
 * Deletes a voucher that was never actually sent anywhere — once a voucher
 * has gone out to a hotel or customer it's part of the real communication
 * history, so it must be superseded (via regeneration) rather than erased.
 */
const deleteVoucher = async (voucherId) => {
  const voucher = await HotelVoucher.findById(voucherId).populate('document');
  if (!voucher) throw ApiError.notFound('Hotel voucher not found.');
  if (voucher.status === 'Sent') {
    throw ApiError.badRequest('This voucher has already been sent and cannot be deleted. Regenerate vouchers for the booking instead.');
  }

  if (voucher.document) {
    await Document.findByIdAndDelete(voucher.document._id);
  }
  await voucher.deleteOne();
};

const emailVoucher = async (voucherId, audience) => {
  const voucher = await HotelVoucher.findById(voucherId).populate('document');
  if (!voucher) throw ApiError.notFound('Hotel voucher not found.');
  if (!voucher.document) throw ApiError.badRequest('Generate the voucher before emailing it.');

  const to = audience === 'hotel' ? voucher.hotelSnapshot.contactEmail : voucher.customerEmail;
  if (!to) throw ApiError.badRequest(`No ${audience === 'hotel' ? 'hotel contact' : 'customer'} email is on file for this voucher.`);

  const lang = audience === 'customer' ? (await Customer.findById(voucher.customer).select('preferredLanguage'))?.preferredLanguage || 'en' : 'en';

  // The PDF lives on Cloudinary, not local disk — nodemailer fetches
  // attachment content directly from an http(s) `path`.
  await sendEmail({
    to,
    subject:
      audience === 'hotel'
        ? `Booking Confirmation Request — ${voucher.voucherNumber} — ${voucher.hotelSnapshot.name}`
        : `Your Hotel Voucher — ${voucher.hotelSnapshot.name} (${voucher.voucherNumber})`,
    html: hotelVoucherEmail({ voucher, audience, lang }),
    attachments: [{ filename: voucher.document.fileName, path: voucher.document.fileUrl }],
  });

  if (audience === 'hotel') {
    voucher.sentToHotelAt = new Date();
  } else {
    voucher.sentToCustomerAt = new Date();
  }
  if (voucher.status !== 'Superseded') voucher.status = 'Sent';
  await voucher.save();
  return voucher;
};

const listVouchersForBooking = async (bookingId) => {
  const vouchers = await HotelVoucher.find({ booking: bookingId }).populate('hotel', 'name').populate('document').sort({ sequence: 1, createdAt: -1 });
  return {
    current: vouchers.filter((v) => v.status !== 'Superseded'),
    history: vouchers.filter((v) => v.status === 'Superseded'),
  };
};

const getVoucherById = async (voucherId) => {
  const voucher = await HotelVoucher.findById(voucherId).populate('hotel', 'name').populate('document');
  if (!voucher) throw ApiError.notFound('Hotel voucher not found.');
  return voucher;
};

module.exports = {
  groupHotelStays,
  generateVouchersForBooking,
  updateVoucher,
  deleteVoucher,
  emailVoucher,
  listVouchersForBooking,
  getVoucherById,
};
