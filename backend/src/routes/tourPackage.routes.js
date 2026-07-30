const router = require('express').Router();
const controller = require('../controllers/tourPackage.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTourPackageSchema, updateTourPackageSchema } = require('../validators/tourPackage.validator');

// Public: Tour Packages page automatically retrieves all published packages
router.get('/', controller.getAllPublic);
router.get('/slug/:slug', controller.getBySlug);
router.get('/:id', controller.getOne);

router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/admin/all', controller.getAll);
router.post('/', validate({ body: createTourPackageSchema }), controller.create);
router.patch('/:id', validate({ body: updateTourPackageSchema }), controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/publish', controller.publish);
router.patch('/:id/archive', controller.archive);
router.patch('/:id/unpublish', controller.unpublish);

module.exports = router;
