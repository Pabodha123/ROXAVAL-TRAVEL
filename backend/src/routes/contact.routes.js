const router = require('express').Router();
const controller = require('../controllers/contact.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createContactSchema, updateContactStatusSchema } = require('../validators/contact.validator');

router.post('/', validate({ body: createContactSchema }), controller.create);

router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/admin/all', controller.getAll);
router.get('/:id', controller.getOne);
router.patch('/:id/status', validate({ body: updateContactStatusSchema }), controller.updateStatus);
router.delete('/:id', controller.remove);

module.exports = router;
