const { z } = require('zod');

const itineraryDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(2),
  description: z.string().min(5),
  destinations: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  hotel: z.string().optional(),
  meals: z.array(z.enum(['Breakfast', 'Lunch', 'Dinner'])).optional(),
});

const createTourPackageSchema = z.object({
  name: z.string().min(3),
  category: z
    .enum(['Best Seller', 'Scenic', 'Adventure', 'Relax', 'Luxury', 'Signature', 'Honeymoon', 'Family', 'Wildlife'])
    .optional(),
  tourType: z.enum(['Private', 'Group']).optional(),
  heroImage: z.string().min(1),
  gallery: z.array(z.string()).optional(),
  destinations: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  hotels: z.array(z.string()).optional(),
  durationDays: z.number().int().min(1),
  durationNights: z.number().int().min(0),
  itinerary: z.array(itineraryDaySchema).optional(),
  includedServices: z.array(z.string()).optional(),
  excludedServices: z.array(z.string()).optional(),
  description: z.string().min(10),
  highlights: z.array(z.string()).optional(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  minTravelers: z.number().int().min(1).optional(),
  maxTravelers: z.number().int().min(1).optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  isFeatured: z.boolean().optional(),
});

const updateTourPackageSchema = createTourPackageSchema.partial();

module.exports = { createTourPackageSchema, updateTourPackageSchema };
