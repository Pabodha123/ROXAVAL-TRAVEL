const router = require('express').Router();
const controller = require('../controllers/blog.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createBlogSchema, updateBlogSchema } = require('../validators/catalog.validator');

router.get('/', controller.getAllPublished);
router.get('/slug/:slug', controller.getBySlug);
router.get('/:id', controller.getOne);

router.use(protect, restrictTo('admin', 'superadmin'));
router.get('/admin/all', controller.getAll);
router.post('/', validate({ body: createBlogSchema }), controller.create);
router.patch('/:id', validate({ body: updateBlogSchema }), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
