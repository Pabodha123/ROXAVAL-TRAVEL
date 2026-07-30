const router = require('express').Router();
const controller = require('../controllers/vehicle.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createVehicleSchema, updateVehicleSchema } = require('../validators/catalog.validator');

router.get('/', controller.getAllActive);
router.get('/:id', controller.getOne);

router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/admin/all', controller.getAll);
router.post('/', validate({ body: createVehicleSchema }), controller.create);
router.patch('/:id', validate({ body: updateVehicleSchema }), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
