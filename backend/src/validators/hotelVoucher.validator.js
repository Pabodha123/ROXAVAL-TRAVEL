const { z } = require('zod');

const updateHotelVoucherSchema = z.object({
  roomType: z.string().optional(),
  numberOfRooms: z.number().int().min(1).optional(),
  mealPlan: z.enum(['Room Only', 'BB', 'HB', 'FB', 'AI']).optional(),
  ratePerNight: z.number().min(0).optional(),
  specialRequests: z.string().optional(),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional(),
  emergencyContact: z.string().optional(),
});

module.exports = { updateHotelVoucherSchema };
