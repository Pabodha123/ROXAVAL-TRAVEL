const router = require('express').Router();
const controller = require('../controllers/activity.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createActivitySchema, updateActivitySchema } = require('../validators/catalog.validator');

router.get('/', controller.getAllPublic);
router.get('/:id', controller.getOne);

router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/admin/all', controller.getAll);
router.post('/', validate({ body: createActivitySchema }), controller.create);
router.patch('/:id', validate({ body: updateActivitySchema }), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
