const router = require('express').Router();
const controller = require('../controllers/booking.controller');
const hotelVoucherController = require('../controllers/hotelVoucher.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPackageBookingSchema, updateBookingStatusSchema } = require('../validators/booking.validator');
const { z } = require('zod');

router.use(protect);

// Customer
router.post('/from-package', restrictTo('customer'), validate({ body: createPackageBookingSchema }), controller.createFromPackage);
router.post(
  '/from-itinerary',
  restrictTo('customer'),
  validate({
    body: z.object({
      itinerary: z.string().min(1),
      travelDate: z.coerce.date(),
      travelers: z.object({ adults: z.number().int().min(1), children: z.number().int().min(0).optional(), infants: z.number().int().min(0).optional() }),
      specialRequests: z.string().optional(),
    }),
  }),
  controller.createFromItinerary
);
router.get('/my-bookings', restrictTo('customer'), controller.getMyBookings);
router.get('/my-bookings/:id', restrictTo('customer'), controller.getMyBookingById);

// Admin
router.get('/', restrictTo('admin', 'superadmin'), controller.getAllBookings);
router.get('/:id', restrictTo('admin', 'superadmin'), controller.getBookingById);
router.patch('/:id/status', restrictTo('admin', 'superadmin'), validate({ body: updateBookingStatusSchema }), controller.updateStatus);

router.get('/:id/hotel-vouchers', restrictTo('admin', 'superadmin'), hotelVoucherController.listForBooking);
router.post('/:id/hotel-vouchers/generate', restrictTo('admin', 'superadmin'), hotelVoucherController.generateForBooking);

module.exports = router;
