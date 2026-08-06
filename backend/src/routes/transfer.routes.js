const router = require('express').Router();
const controller = require('../controllers/transfer.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTransferSchema, updateTransferSchema } = require('../validators/catalog.validator');

router.get('/', controller.getAllActive);
router.get('/:id', controller.getOne);

router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/admin/all', controller.getAll);
router.post('/', validate({ body: createTransferSchema }), controller.create);
router.patch('/:id', validate({ body: updateTransferSchema }), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
