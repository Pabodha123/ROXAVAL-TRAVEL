const router = require('express').Router();
const controller = require('../controllers/settings.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', controller.getSettings);
router.patch('/', protect, restrictTo('admin', 'superadmin'), controller.updateSettings);

module.exports = router;
