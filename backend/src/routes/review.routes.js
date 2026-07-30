const router = require('express').Router();
const controller = require('../controllers/review.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewSchema, moderateReviewSchema } = require('../validators/catalog.validator');

// Public: only approved reviews are shown
router.get('/', controller.getApproved);
router.get('/stats', controller.getStats);

// Customer
router.post('/', protect, restrictTo('customer'), validate({ body: createReviewSchema }), controller.create);
router.get('/my-reviews', protect, restrictTo('customer'), controller.getMyReviews);

// Admin moderation
router.get('/admin/all', protect, restrictTo('admin', 'superadmin'), controller.getAllForModeration);
router.patch('/:id/moderate', protect, restrictTo('admin', 'superadmin'), validate({ body: moderateReviewSchema }), controller.moderate);
router.delete('/:id', protect, restrictTo('admin', 'superadmin'), controller.remove);

module.exports = router;
