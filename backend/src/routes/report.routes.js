const router = require('express').Router();
const controller = require('../controllers/report.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin', 'superadmin'));

router.get('/dashboard', controller.getDashboardStats);
router.get('/revenue', controller.getRevenueReport);
router.get('/bookings', controller.getBookingsReport);
router.post('/', controller.saveReport);
router.get('/', controller.getSavedReports);
router.get('/:id', controller.getSavedReportById);

module.exports = router;
