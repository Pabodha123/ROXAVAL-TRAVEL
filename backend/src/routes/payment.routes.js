const router = require('express').Router();
const controller = require('../controllers/payment.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadReceipt } = require('../middleware/upload');
const { createPaymentSchema, verifyPaymentSchema } = require('../validators/booking.validator');

router.use(protect);

// Customer
router.post('/', restrictTo('customer'), validate({ body: createPaymentSchema }), controller.createPayment);
router.post('/:id/receipt', restrictTo('customer'), uploadReceipt.single('receipt'), controller.uploadReceipt);
router.get('/my-payments', restrictTo('customer'), controller.getMyPayments);

// Admin
router.get('/', restrictTo('admin', 'superadmin'), controller.getAllPayments);
router.patch('/:id/verify', restrictTo('admin', 'superadmin'), validate({ body: verifyPaymentSchema }), controller.verifyPayment);

module.exports = router;
