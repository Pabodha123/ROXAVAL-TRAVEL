const router = require('express').Router();
const controller = require('../controllers/newsletter.controller');
const validate = require('../middleware/validate');
const { subscribeNewsletterSchema } = require('../validators/newsletter.validator');

router.post('/', validate({ body: subscribeNewsletterSchema }), controller.subscribe);

module.exports = router;
