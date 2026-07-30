const router = require('express').Router();
const controller = require('../controllers/tourGuide.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTourGuideSchema, updateTourGuideSchema } = require('../validators/catalog.validator');

router.get('/', controller.getAllActive);
router.get('/:id', controller.getOne);

router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/admin/all', controller.getAll);
router.post('/', validate({ body: createTourGuideSchema }), controller.create);
router.patch('/:id', validate({ body: updateTourGuideSchema }), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
