const router = require('express').Router();
const controller = require('../controllers/document.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// Customer: view/download their own generated documents
router.get('/my-documents', restrictTo('customer'), controller.getMyDocuments);

// Any logged-in user: stream a document's PDF (ownership/type checked
// inside the handler, since a customer may open their own non-voucher
// documents while staff may open any).
router.get('/:id/file', controller.viewFile);

// Admin: generate documents + view all
router.use(restrictTo('admin', 'superadmin'));
router.get('/', controller.getAllDocuments);
router.post('/bookings/:bookingId/itinerary', controller.generateItinerary);
router.post('/bookings/:bookingId/confirmation', controller.generateBookingConfirmation);
router.post('/bookings/:bookingId/invoice', controller.generateInvoice);
router.post('/payments/:paymentId/receipt', controller.generatePaymentReceipt);
router.post('/itineraries/:itineraryId/quotation', controller.generateQuotation);

module.exports = router;
