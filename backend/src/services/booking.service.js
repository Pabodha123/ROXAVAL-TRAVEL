const mongoose = require('mongoose');
const { Booking, TourPackage, Itinerary, CustomTourRequest, Customer, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { notify } = require('./notification.service');
const documentService = require('./document.service');

const ADVANCE_PERCENTAGE = 0.3; // 30% advance payment by default

// Single source of truth for the advance/balance split, used by both
// booking-creation paths — balance is always `total - advance` (never
// independently rounded), so the two always sum back to the total exactly.
const splitAdvanceBalance = (totalAmount) => {
  const advanceAmount = Math.round(totalAmount * ADVANCE_PERCENTAGE * 100) / 100;
  const balanceAmount = Math.round((totalAmount - advanceAmount) * 100) / 100;
  return { advanceAmount, balanceAmount };
};

// unitPrice is the adult per-traveler price; children are charged
// `childPricePercent` of that (default 50%), infants stay free.
const computePricing = (unitPrice, travelers, discount = 0, childPricePercent = 50) => {
  const adults = Math.max(travelers.adults || 0, 1);
  const children = travelers.children || 0;
  const subtotal = unitPrice * adults + unitPrice * (childPricePercent / 100) * children;
  const totalAmount = Math.max(Math.round((subtotal - discount) * 100) / 100, 0);
  const { advanceAmount, balanceAmount } = splitAdvanceBalance(totalAmount);
  return { subtotal: Math.round(subtotal * 100) / 100, discount, totalAmount, advanceAmount, balanceAmount, amountPaid: 0 };
};

/**
 * Creates a booking from a standard published TourPackage.
 */
const createFromPackage = async (customerUserId, { tourPackage: packageId, travelDate, travelers, specialRequests }) => {
  const customer = await Customer.findOne({ user: customerUserId });
  if (!customer) throw ApiError.notFound('Customer profile not found.');

  const pkg = await TourPackage.findOne({ _id: packageId, status: 'published' });
  if (!pkg) throw ApiError.notFound('Tour package not found or not available for booking.');

  const unitPrice = pkg.discountPrice || pkg.price;
  const pricing = { ...computePricing(unitPrice, travelers, 0, pkg.childPricePercent), currency: pkg.currency };

  const booking = await Booking.create({
    customer: customer._id,
    sourceType: 'package',
    tourPackage: pkg._id,
    travelDate,
    travelers,
    pricing,
    specialRequests,
    status: 'Payment Pending',
    statusHistory: [{ status: 'Payment Pending', note: 'Booking created from tour package', changedBy: customerUserId }],
  });

  await notify({
    recipient: customerUserId,
    type: 'booking_created',
    title: 'Booking Created',
    message: `Your booking ${booking.bookingReference} for "${pkg.name.en}" has been created. Please proceed to payment.`,
    link: `/my-tours/bookings/${booking._id}`,
    relatedModel: 'Booking',
    relatedId: booking._id,
  });

  return booking;
};

/**
 * Creates a booking from a customer-accepted Itinerary.
 */
const createFromItinerary = async (customerUserId, { itineraryId, travelDate, travelers, specialRequests }) => {
  const customer = await Customer.findOne({ user: customerUserId });
  if (!customer) throw ApiError.notFound('Customer profile not found.');

  const itinerary = await Itinerary.findOne({ _id: itineraryId, customer: customer._id, status: 'Accepted' });
  if (!itinerary) throw ApiError.notFound('Accepted itinerary not found for this customer.');

  // A per-person quote (see QuotationView, which labels it "$X / person")
  // is a per-adult rate that must be multiplied by the traveler count to
  // get the real amount owed - matches the traveler count the itinerary
  // was actually priced for, since the booking form locks Adults/Children/
  // Infants to that quoted count rather than letting them be changed here.
  const multiplier = itinerary.pricing.pricePerPerson ? Math.max(travelers.adults || 0, 1) : 1;
  const subtotal = Math.round(itinerary.pricing.basePrice * multiplier * 100) / 100;
  const discount = Math.round((itinerary.pricing.discount || 0) * multiplier * 100) / 100;
  const totalAmount = Math.round(itinerary.pricing.totalPrice * multiplier * 100) / 100;
  const { advanceAmount, balanceAmount } = splitAdvanceBalance(totalAmount);
  const pricing = {
    subtotal,
    discount,
    totalAmount,
    advanceAmount,
    balanceAmount,
    amountPaid: 0,
    currency: itinerary.pricing.currency,
  };

  const booking = await Booking.create({
    customer: customer._id,
    sourceType: 'customized',
    itinerary: itinerary._id,
    travelDate,
    travelers,
    pricing,
    specialRequests,
    status: 'Payment Pending',
    statusHistory: [{ status: 'Payment Pending', note: 'Booking created from approved custom itinerary', changedBy: customerUserId }],
  });

  await notify({
    recipient: customerUserId,
    type: 'booking_created',
    title: 'Booking Created',
    message: `Your customized tour booking ${booking.bookingReference} has been created. Please proceed to payment.`,
    link: `/my-tours/bookings/${booking._id}`,
    relatedModel: 'Booking',
    relatedId: booking._id,
  });

  await CustomTourRequest.findByIdAndUpdate(itinerary.customTourRequest, { status: 'Booking Confirmed' });

  return booking;
};

const VALID_TRANSITIONS = {
  Pending: ['Awaiting Approval', 'Cancelled'],
  'Awaiting Approval': ['Approved', 'Cancelled'],
  Approved: ['Payment Pending', 'Cancelled'],
  'Payment Pending': ['Payment Verification', 'Cancelled'],
  'Payment Verification': ['Confirmed', 'Payment Pending', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const updateStatus = async (bookingId, newStatus, note, actorUserId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found.');

  const allowed = VALID_TRANSITIONS[booking.status] || [];
  if (booking.status !== newStatus && !allowed.includes(newStatus)) {
    throw ApiError.badRequest(`Cannot transition booking from '${booking.status}' to '${newStatus}'.`);
  }

  booking.status = newStatus;
  booking.statusHistory.push({ status: newStatus, note, changedBy: actorUserId });
  await booking.save();

  if (newStatus === 'Confirmed') {
    await Customer.findByIdAndUpdate(booking.customer, {
      $inc: { totalBookings: 1, totalSpend: booking.pricing.totalAmount },
    });

    // Auto-generate the booking confirmation PDF on confirmation. Hotel
    // vouchers are a separate, admin-triggered workflow (see
    // hotelVoucher.service.js) since they need review/editing before
    // being sent to hotels/customers, not silent auto-generation.
    await documentService.generateBookingConfirmation(booking._id, actorUserId).catch(() => {});
  }

  const customer = await Customer.findById(booking.customer).populate('user');
  if (customer?.user) {
    await notify({
      recipient: customer.user._id,
      type: 'booking_confirmed',
      title: `Booking ${newStatus}`,
      message: `Your booking ${booking.bookingReference} is now "${newStatus}".${note ? ` Note: ${note}` : ''}`,
      link: `/my-tours/bookings/${booking._id}`,
      relatedModel: 'Booking',
      relatedId: booking._id,
    });
  }

  return booking;
};

module.exports = { computePricing, createFromPackage, createFromItinerary, updateStatus, VALID_TRANSITIONS };
