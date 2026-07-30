const router = require('express').Router();
const controller = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/me', controller.getMyAdminProfile);
router.patch('/me', controller.updateMyAdminProfile);
router.get('/', controller.getAllAdmins);
router.post('/', restrictTo('superadmin'), controller.createAdmin);
router.patch('/:id', restrictTo('superadmin'), controller.updateAdmin);
router.patch('/:id/active', restrictTo('superadmin'), controller.setAdminActive);

module.exports = router;
