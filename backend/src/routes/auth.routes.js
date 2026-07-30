const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} = require('../validators/auth.validator');

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.patch('/reset-password/:token', validate({ body: resetPasswordSchema }), authController.resetPassword);
router.patch('/update-password', protect, validate({ body: updatePasswordSchema }), authController.updatePassword);

module.exports = router;
