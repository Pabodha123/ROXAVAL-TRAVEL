const env = require('../config/env');

/**
 * Builds a wa.me deep link with a pre-filled message so the customer's
 * WhatsApp app opens directly with booking/payment details ready to send
 * to the Roxaval Travels business number.
 */
const buildWhatsAppPaymentLink = ({
  bookingReference,
  customerName,
  packageName,
  travelDate,
  totalAmount,
  advanceAmount,
  currency = 'USD',
}) => {
  const lines = [
    `Hello Roxaval Travels, I would like to arrange payment for my booking.`,
    ``,
    `Booking Reference: ${bookingReference}`,
    `Customer Name: ${customerName}`,
    `Package: ${packageName}`,
    `Travel Date: ${travelDate}`,
    `Total Amount: ${currency} ${totalAmount}`,
    `Advance Payment Due: ${currency} ${advanceAmount}`,
    ``,
    `Please confirm the next steps for payment.`,
  ];

  const message = encodeURIComponent(lines.join('\n'));
  const number = env.PAYMENTS.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${message}`;
};

module.exports = { buildWhatsAppPaymentLink };
