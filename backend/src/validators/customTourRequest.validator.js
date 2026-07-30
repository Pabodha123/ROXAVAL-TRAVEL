const { z } = require('zod');

const createCustomTourRequestSchema = z.object({
  travelDates: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isFlexible: z.boolean().optional(),
  }),
  travelers: z.object({
    adults: z.number().int().min(1),
    children: z.number().int().min(0).optional(),
    infants: z.number().int().min(0).optional(),
  }),
  preferredDestinations: z.array(z.string()).optional(),
  preferredActivities: z.array(z.string()).optional(),
  customDestinations: z.array(z.string()).optional(),
  customActivities: z.array(z.string()).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  hotelCategory: z.enum(['Budget', 'Standard', 'Deluxe', 'Boutique', 'Luxury', 'Resort']).optional(),
  mealPreferences: z.array(z.string()).optional(),
  travelStyle: z
    .enum(['Relaxed', 'Adventure', 'Cultural', 'Luxury', 'Family', 'Honeymoon', 'Backpacking'])
    .optional(),
  transportPreference: z.enum(['Private Car', 'Van', 'SUV', 'Minibus', 'No Preference']).optional(),
  estimatedBudget: z.object({
    amount: z.number().positive(),
    currency: z.string().optional(),
    perPerson: z.boolean().optional(),
  }),
  specialRequests: z.string().optional(),
  aiGeneratedItinerary: z
    .object({
      summary: z.string().optional(),
      days: z.array(
        z.object({
          dayNumber: z.number().int().min(1),
          title: z.string(),
          schedule: z.string(),
          destinations: z.array(z.string()).optional(),
          activities: z.array(z.string()).optional(),
          hotel: z.string().optional().transform((v) => (v ? v : undefined)),
          meals: z.array(z.enum(['Breakfast', 'Lunch', 'Dinner'])).optional(),
        })
      ),
      estimatedTotal: z.number().optional(),
      currency: z.string().optional(),
      generatedAt: z.coerce.date().optional(),
    })
    .optional(),
});

const buildItinerarySchema = z.object({
  title: z.string().min(3),
  summary: z.string().optional(),
  days: z.array(
    z.object({
      dayNumber: z.number().int().min(1),
      date: z.coerce.date().optional(),
      title: z.string().min(2),
      schedule: z.string().min(5),
      destinations: z.array(z.string()).optional(),
      activities: z.array(z.string()).optional(),
      customDestinations: z.array(z.string()).optional(),
      customActivities: z.array(z.string()).optional(),
      hotel: z.string().optional().transform((v) => (v ? v : undefined)),
      roomType: z.string().optional(),
      numberOfRooms: z.number().int().min(1).optional(),
      tourGuide: z.string().optional().transform((v) => (v ? v : undefined)),
      vehicle: z.string().optional().transform((v) => (v ? v : undefined)),
      meals: z.array(z.enum(['Breakfast', 'Lunch', 'Dinner'])).optional(),
      transport: z.string().optional(),
      arrivalTime: z.string().optional(),
      departureTime: z.string().optional(),
      travelTime: z.string().optional(),
      notes: z.string().optional(),
    })
  ),
  hotels: z.array(z.string()).optional(),
  pricing: z.object({
    basePrice: z.number().positive(),
    discount: z.number().min(0).optional(),
    totalPrice: z.number().positive(),
    currency: z.string().optional(),
    pricePerPerson: z.boolean().optional(),
  }),
  adminNotes: z.string().optional(),
  customerFacingNotes: z.string().optional(),
});

const requestChangesSchema = z.object({
  note: z.string().min(3, 'Please describe the changes you would like'),
});

const cannotModifySchema = z.object({
  note: z.string().min(10, 'Please explain why this change cannot be made'),
});

const updatePrioritySchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High']),
});

module.exports = {
  createCustomTourRequestSchema,
  buildItinerarySchema,
  requestChangesSchema,
  cannotModifySchema,
  updatePrioritySchema,
};
