const router = require('express').Router();
const controller = require('../controllers/birthday.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateConfigSchema } = require('../validators/birthday.validator');

// Cron-only (secured by CRON_SECRET header, checked inside the controller —
// there's no admin session available when Vercel Cron calls this). Vercel
// Cron Jobs always send a GET request.
router.get('/run-daily-cron', controller.runDailyCron);

// Customer: dashboard confetti card
router.get('/me/today', protect, restrictTo('customer'), controller.getMyBirthdayToday);

// Admin: Birthday Management
router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/today', controller.getToday);
router.get('/upcoming', controller.getUpcoming);
router.get('/config', controller.getConfig);
router.patch('/config', validate({ body: updateConfigSchema }), controller.updateConfig);
router.get('/logs', controller.getLogs);
router.post('/resend/:customerId', controller.resend);
router.post('/run-now', controller.runNow);

module.exports = router;
