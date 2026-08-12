const { z } = require('zod');
const { localizedField, localizedFieldArray } = require('./shared/localized');

// ---------- Activity ----------
const createActivitySchema = z.object({
  name: localizedField(2),
  description: localizedField(10),
  image: z.string().min(1),
  gallery: z.array(z.string()).optional(),
  category: z.enum(['Adventure', 'Wildlife', 'Culture', 'Relaxation', 'Scenic', 'Water Sports', 'Nature']).optional(),
  durationHours: z.number().positive().optional(),
  priceFrom: z.number().min(0).optional(),
  pricing: z
    .object({
      adult: z.number().min(0).optional(),
      child: z.number().min(0).optional(),
      infant: z.number().min(0).optional(),
    })
    .optional(),
  destinations: z.array(z.string()).optional(),
  difficultyLevel: z.enum(['Easy', 'Moderate', 'Hard']).optional(),
  location: localizedField(0).optional(),
  bestSeason: localizedField(0).optional(),
  highlights: localizedFieldArray().optional(),
  thingsIncluded: localizedFieldArray().optional(),
  thingsToBring: localizedFieldArray().optional(),
  mapLocation: z.object({ lat: z.number(), lng: z.number() }).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
const updateActivitySchema = createActivitySchema.partial();

// ---------- Hotel ----------
const occupancyPricingSchema = z.object({
  single: z.number().min(0).optional(),
  double: z.number().min(0).optional(),
  triple: z.number().min(0).optional(),
  quad: z.number().min(0).optional(),
  extraBed: z.number().min(0).optional(),
  childWithBed: z.number().min(0).optional(),
  childNoBed: z.number().min(0).optional(),
  infant: z.number().min(0).optional(),
});
const seasonalRateSchema = z.object({
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  currency: z.string().optional(),
  pricing: occupancyPricingSchema.optional(),
});
const roomTypeSchema = z.object({
  name: localizedField(2),
  maxOccupancy: z.number().int().min(1).optional(),
  pricePerNight: z.number().positive(),
  mealPlan: z.enum(['Room Only', 'Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive']).optional(),
  pricing: occupancyPricingSchema.optional(),
  seasonalRates: z.array(seasonalRateSchema).optional(),
  amenities: localizedFieldArray().optional(),
});
const createHotelSchema = z.object({
  name: localizedField(2),
  category: z.enum(['Budget', 'Standard', 'Deluxe', 'Boutique', 'Luxury', 'Resort']).optional(),
  starRating: z.number().min(1).max(5).optional(),
  destination: z.string().min(1),
  address: localizedField(5),
  description: localizedField(10),
  images: z.array(z.string()).optional(),
  amenities: localizedFieldArray().optional(),
  roomTypes: z.array(roomTypeSchema).optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPersons: z.array(z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  })).max(3).optional(),
  isPartner: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
const updateHotelSchema = createHotelSchema.partial();

// ---------- Tour Guide ----------
const createTourGuideSchema = z.object({
  name: z.string().min(2),
  photo: z.string().optional(),
  languages: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  yearsExperience: z.number().min(0).optional(),
  bio: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  pricePerDay: z.number().positive(),
  status: z.enum(['active', 'inactive']).optional(),
});
const updateTourGuideSchema = createTourGuideSchema.partial();

// ---------- Vehicle ----------
const createVehicleSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['Car', 'Van', 'SUV', 'Minibus', 'Bus']).optional(),
  capacity: z.number().int().positive(),
  driverIncluded: z.boolean().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  pricePerDay: z.number().positive(),
  status: z.enum(['active', 'inactive']).optional(),
});
const updateVehicleSchema = createVehicleSchema.partial();

// ---------- Transfer ----------
const createTransferSchema = z.object({
  name: z.string().min(2),
  destination: z.string().min(1),
  supplier: z.string().optional(),
  type: z.enum(['Private (PVT)', 'Seat-in-Coach (SIC)']).optional(),
  transferFor: z.string().optional(),
  vehicle: z.string().optional().transform((v) => (v ? v : undefined)),
  costWithDriver: z.number().positive(),
  costWithoutDriver: z.number().min(0).optional(),
  currency: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
const updateTransferSchema = createTransferSchema.partial();

// ---------- Review ----------
const createReviewSchema = z.object({
  tourPackage: z.string().optional(),
  booking: z.string().min(1, 'A completed booking is required to leave a review'),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  text: z.string().min(10),
  country: z.string().optional(),
  images: z.array(z.string()).optional(),
});
const moderateReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  moderationNote: z.string().optional(),
});

// ---------- Blog ----------
const blogSectionSchema = z.object({
  heading: localizedField(2),
  body: localizedField(10),
  image: z.string().optional(),
});
const createBlogSchema = z.object({
  title: localizedField(3),
  excerpt: localizedField(10),
  content: localizedField(20),
  sections: z.array(blogSectionSchema).optional(),
  template: z.enum(['default', 'romantic']).optional(),
  featuredImage: z.string().min(1),
  gallery: z.array(z.string()).optional(),
  category: z.string().min(2),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});
const updateBlogSchema = createBlogSchema.partial();

module.exports = {
  createActivitySchema,
  updateActivitySchema,
  createHotelSchema,
  updateHotelSchema,
  createTourGuideSchema,
  updateTourGuideSchema,
  createVehicleSchema,
  updateVehicleSchema,
  createTransferSchema,
  updateTransferSchema,
  createReviewSchema,
  moderateReviewSchema,
  createBlogSchema,
  updateBlogSchema,
};
