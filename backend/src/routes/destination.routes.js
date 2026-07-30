const router = require('express').Router();
const controller = require('../controllers/destination.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDestinationSchema, updateDestinationSchema, attractionSchema } = require('../validators/destination.validator');

// Public
router.get('/', controller.getAllPublic);
router.get('/:id', controller.getOne);

// Admin
router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/admin/all', controller.getAll);
router.post('/', validate({ body: createDestinationSchema }), controller.create);
router.patch('/:id', validate({ body: updateDestinationSchema }), controller.update);
router.delete('/:id', controller.remove);

router.post('/:id/attractions', validate({ body: attractionSchema }), controller.addAttraction);
router.patch('/:id/attractions/:attractionId', controller.updateAttraction);
router.delete('/:id/attractions/:attractionId', controller.removeAttraction);

module.exports = router;
