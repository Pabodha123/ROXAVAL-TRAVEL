const router = require('express').Router();
const controller = require('../controllers/customer.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// Customer self-service
router.get('/me', restrictTo('customer'), controller.getMyProfile);
router.patch('/me', restrictTo('customer'), controller.updateMyProfile);

// Admin: Customer Management
router.get('/', restrictTo('admin', 'superadmin'), controller.getAllCustomers);
router.get('/:id', restrictTo('admin', 'superadmin'), controller.getCustomerById);
router.patch('/:id/active', restrictTo('admin', 'superadmin'), controller.setCustomerActive);
router.patch('/:id/notes', restrictTo('admin', 'superadmin'), controller.updateNotes);

module.exports = router;
