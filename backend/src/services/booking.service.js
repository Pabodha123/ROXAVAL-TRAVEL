const mongoose = require('mongoose');
const { Booking, TourPackage, Itinerary, CustomTourRequest, Customer, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { notify } = require('./notification.service');
const documentService = require('./document.service');

const ADVANCE_PERCENTAGE = 0.3; // 30% advance payment by default

const computePricing = (unitPrice, travelers, discount = 0) => {
  const totalTravelers = (travelers.adults || 0) + (travelers.children || 0);
  const subtotal = unitPrice * Math.max(totalTravelers, 1);
  const totalAmount = Math.max(subtotal - discount, 0);
  const advanceAmount = Math.round(totalAmount * ADVANCE_PERCENTAGE * 100) / 100;
  const balanceAmount = Math.round((totalAmount - advanceAmount) * 100) / 100;
  return { subtotal, discount, totalAmount, advanceAmount, balanceAmount };
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
  const pricing = { ...computePricing(unitPrice, travelers), currency: pkg.currency };

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
    message: `Your booking ${booking.bookingReference} for "${pkg.name}" has been created. Please proceed to payment.`,
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

  const pricing = {
    subtotal: itinerary.pricing.basePrice,
    discount: itinerary.pricing.discount || 0,
    totalAmount: itinerary.pricing.totalPrice,
    advanceAmount: Math.round(itinerary.pricing.totalPrice * ADVANCE_PERCENTAGE * 100) / 100,
    balanceAmount: Math.round(itinerary.pricing.totalPrice * (1 - ADVANCE_PERCENTAGE) * 100) / 100,
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
