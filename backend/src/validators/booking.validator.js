const { z } = require('zod');

const createPackageBookingSchema = z.object({
  tourPackage: z.string().min(1, 'Tour package is required'),
  travelDate: z.coerce.date(),
  travelers: z.object({
    adults: z.number().int().min(1),
    children: z.number().int().min(0).optional(),
    infants: z.number().int().min(0).optional(),
  }),
  specialRequests: z.string().optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum([
    'Pending',
    'Awaiting Approval',
    'Approved',
    'Payment Pending',
    'Payment Verification',
    'Confirmed',
    'Completed',
    'Cancelled',
  ]),
  note: z.string().optional(),
});

const createPaymentSchema = z.object({
  booking: z.string().min(1, 'Booking is required'),
  method: z.enum(['card', 'bank_transfer', 'whatsapp']),
  paymentType: z.enum(['advance', 'balance', 'full']),
  amount: z.number().positive(),
  currency: z.string().optional(),
  bankReference: z.string().optional(),
});

const verifyPaymentSchema = z.object({
  status: z.enum(['Verified', 'Rejected']),
  verificationNote: z.string().optional(),
});

module.exports = {
  createPackageBookingSchema,
  updateBookingStatusSchema,
  createPaymentSchema,
  verifyPaymentSchema,
};
