const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/destinations', require('./destination.routes'));
router.use('/activities', require('./activity.routes'));
router.use('/hotels', require('./hotel.routes'));
router.use('/tour-guides', require('./tourGuide.routes'));
router.use('/vehicles', require('./vehicle.routes'));
router.use('/packages', require('./tourPackage.routes'));
router.use('/blogs', require('./blog.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/custom-tours', require('./customTourRequest.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/documents', require('./document.routes'));
router.use('/hotel-vouchers', require('./hotelVoucher.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/reports', require('./report.routes'));
router.use('/settings', require('./settings.routes'));
router.use('/customers', require('./customer.routes'));
router.use('/contact', require('./contact.routes'));
router.use('/newsletter', require('./newsletter.routes'));
router.use('/admins', require('./admin.routes'));
router.use('/uploads', require('./upload.routes'));

module.exports = router;
