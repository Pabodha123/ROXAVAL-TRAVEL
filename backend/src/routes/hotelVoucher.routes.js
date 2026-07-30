const router = require('express').Router();
const controller = require('../controllers/hotelVoucher.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateHotelVoucherSchema } = require('../validators/hotelVoucher.validator');

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/:id', controller.getOne);
router.patch('/:id', validate({ body: updateHotelVoucherSchema }), controller.update);
router.post('/:id/email-hotel', controller.emailToHotel);
router.post('/:id/email-customer', controller.emailToCustomer);

module.exports = router;
