const { z } = require('zod');
const { localizedField, localizedFieldArray } = require('./shared/localized');

const itineraryDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  title: localizedField(2),
  description: localizedField(5),
  destinations: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  // An empty string (days with no hotel assigned send '' from the admin
  // form) must not reach Mongoose as-is - casting '' to an ObjectId ref
  // throws, so it's normalized to undefined here at the validation boundary.
  hotel: z.string().optional().transform((v) => v || undefined),
  meals: z.array(z.enum(['Breakfast', 'Lunch', 'Dinner'])).optional(),
});

const createTourPackageSchema = z.object({
  name: localizedField(3),
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
  includedServices: localizedFieldArray().optional(),
  excludedServices: localizedFieldArray().optional(),
  description: localizedField(10),
  highlights: localizedFieldArray().optional(),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  childPricePercent: z.number().min(0).max(100).optional(),
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
