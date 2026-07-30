const router = require('express').Router();
const controller = require('../controllers/customTourRequest.controller');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createCustomTourRequestSchema,
  buildItinerarySchema,
  requestChangesSchema,
  cannotModifySchema,
  updatePrioritySchema,
} = require('../validators/customTourRequest.validator');

router.use(protect);

// Customer
router.post('/generate-itinerary', restrictTo('customer'), validate({ body: createCustomTourRequestSchema.omit({ aiGeneratedItinerary: true }) }), controller.generateItinerary);
router.post('/', restrictTo('customer'), validate({ body: createCustomTourRequestSchema }), controller.submitRequest);
router.get('/my-requests', restrictTo('customer'), controller.getMyRequests);
router.get('/my-requests/:id', restrictTo('customer'), controller.getMyRequestById);
router.patch('/:id/accept', restrictTo('customer'), controller.acceptItinerary);
router.patch('/:id/reject', restrictTo('customer'), controller.rejectItinerary);
router.patch('/:id/request-changes', restrictTo('customer'), validate({ body: requestChangesSchema }), controller.requestChanges);

// Admin
router.get('/', restrictTo('admin', 'superadmin'), controller.getAllRequests);
router.get('/:id', restrictTo('admin', 'superadmin'), controller.getRequestById);
router.patch('/:id/assign', restrictTo('admin', 'superadmin'), controller.assignAdmin);
router.patch('/:id/priority', restrictTo('admin', 'superadmin'), validate({ body: updatePrioritySchema }), controller.updatePriority);
router.post('/:id/itinerary', restrictTo('admin', 'superadmin'), validate({ body: buildItinerarySchema }), controller.buildItinerary);
router.post('/:id/cannot-modify', restrictTo('admin', 'superadmin'), validate({ body: cannotModifySchema }), controller.cannotModify);

module.exports = router;
