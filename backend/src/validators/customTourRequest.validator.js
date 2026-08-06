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
    childAges: z.array(z.number().int().min(0)).optional(),
    infantAges: z.array(z.number().int().min(0)).optional(),
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
  roomTypePreference: z.string().optional(),
  guideRequired: z.boolean().optional(),
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

const roomOccupancySchema = z.object({
  single: z.number().min(0).optional(),
  double: z.number().min(0).optional(),
  triple: z.number().min(0).optional(),
  quad: z.number().min(0).optional(),
  extraBed: z.number().min(0).optional(),
  childWithBed: z.number().min(0).optional(),
  childNoBed: z.number().min(0).optional(),
  infant: z.number().min(0).optional(),
});

const buildItinerarySchema = z.object({
  title: z.string().min(3),
  summary: z.string().optional(),
  days: z.array(
    z.object({
      dayNumber: z.number().int().min(1),
      date: z.coerce.date().optional(),
      title: z.string().min(2),
      schedule: z.string().optional().default(''),
      destinations: z.array(z.string()).optional(),
      activities: z.array(z.string()).optional(),
      customDestinations: z.array(z.string()).optional(),
      customActivities: z.array(z.string()).optional(),
      hotel: z.string().optional().transform((v) => (v ? v : undefined)),
      roomType: z.string().optional(),
      numberOfRooms: z.number().int().min(1).optional(),
      roomOccupancy: roomOccupancySchema.optional(),
      roomCost: z.number().min(0).optional(),
      hotelOptions: z
        .array(
          z.object({
            hotel: z.string().optional().transform((v) => (v ? v : undefined)),
            roomType: z.string().optional(),
            numberOfRooms: z.number().int().min(1).optional(),
            roomOccupancy: roomOccupancySchema.optional(),
            roomCost: z.number().min(0).optional(),
            selected: z.boolean().optional(),
          })
        )
        .optional(),
      meals: z.array(z.enum(['Breakfast', 'Lunch', 'Dinner'])).optional(),
      transport: z.string().optional(),
      activityPricing: z
        .array(
          z.object({
            activity: z.string().optional().transform((v) => (v ? v : undefined)),
            adultCount: z.number().min(0).optional(),
            childCount: z.number().min(0).optional(),
            infantCount: z.number().min(0).optional(),
            cost: z.number().min(0).optional(),
            selected: z.boolean().optional(),
          })
        )
        .optional(),
      transfers: z
        .array(
          z.object({
            transfer: z.string().optional().transform((v) => (v ? v : undefined)),
            withDriver: z.boolean().optional(),
            vehicleCount: z.number().int().min(1).optional(),
            cost: z.number().min(0).optional(),
            selected: z.boolean().optional(),
          })
        )
        .optional(),
      flights: z
        .array(
          z.object({
            airline: z.string().optional(),
            flightNumber: z.string().optional(),
            from: z.string().optional(),
            to: z.string().optional(),
            departureTime: z.string().optional(),
            arrivalTime: z.string().optional(),
            cost: z.number().min(0).optional(),
            selected: z.boolean().optional(),
          })
        )
        .optional(),
      dayCost: z.number().min(0).optional(),
      arrivalTime: z.string().optional(),
      departureTime: z.string().optional(),
      travelTime: z.string().optional(),
      notes: z.string().optional(),
    })
  ),
  hotels: z.array(z.string()).optional(),
  tourGuide: z.string().optional().transform((v) => (v ? v : undefined)),
  vehicle: z.string().optional().transform((v) => (v ? v : undefined)),
  pricing: z.object({
    basePrice: z.number().positive(),
    discount: z.number().min(0).optional(),
    totalPrice: z.number().positive(),
    currency: z.string().optional(),
    pricePerPerson: z.boolean().optional(),
  }),
  adminNotes: z.string().optional(),
  customerFacingNotes: z.string().optional(),
  visaRequirements: z.string().optional(),
  travelInsurance: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  inclusions: z.string().optional(),
  exclusions: z.string().optional(),
});

const adminCreateRequestSchema = createCustomTourRequestSchema
  .extend({
    customerId: z.string().optional(),
    newCustomer: z
      .object({
        fullName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
      })
      .optional(),
    leadSource: z.enum(['Website', 'Phone', 'Email', 'Walk-in', 'Referral', 'Agent', 'Other']).optional(),
    operationPerson: z.string().optional().transform((v) => (v ? v : undefined)),
    salesPerson: z.string().optional().transform((v) => (v ? v : undefined)),
    company: z.string().optional(),
  })
  .refine((data) => Boolean(data.customerId) !== Boolean(data.newCustomer), {
    message: 'Provide either an existing customerId or newCustomer details, not both',
    path: ['customerId'],
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

const sendMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(2000),
});

module.exports = {
  createCustomTourRequestSchema,
  adminCreateRequestSchema,
  buildItinerarySchema,
  requestChangesSchema,
  cannotModifySchema,
  updatePrioritySchema,
  sendMessageSchema,
};
