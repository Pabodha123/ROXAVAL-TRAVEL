const router = require('express').Router();
const controller = require('../controllers/customer.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCustomerSchema } = require('../validators/customer.validator');

router.use(protect);

// Customer self-service
router.get('/me', restrictTo('customer'), controller.getMyProfile);
router.patch('/me', restrictTo('customer'), controller.updateMyProfile);

// Admin: Customer Management
router.get('/', restrictTo('admin', 'superadmin'), controller.getAllCustomers);
router.post('/', restrictTo('admin', 'superadmin'), validate({ body: createCustomerSchema }), controller.createCustomer);
router.get('/:id', restrictTo('admin', 'superadmin'), controller.getCustomerById);
router.patch('/:id/active', restrictTo('admin', 'superadmin'), controller.setCustomerActive);
router.patch('/:id/notes', restrictTo('admin', 'superadmin'), controller.updateNotes);
router.patch('/:id/profile', restrictTo('admin', 'superadmin'), controller.updateProfile);

module.exports = router;
