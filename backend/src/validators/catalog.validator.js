const { z } = require('zod');

// ---------- Activity ----------
const createActivitySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  image: z.string().min(1),
  gallery: z.array(z.string()).optional(),
  category: z.enum(['Adventure', 'Wildlife', 'Culture', 'Relaxation', 'Scenic', 'Water Sports', 'Nature']).optional(),
  durationHours: z.number().positive().optional(),
  priceFrom: z.number().min(0).optional(),
  destinations: z.array(z.string()).optional(),
  difficultyLevel: z.enum(['Easy', 'Moderate', 'Hard']).optional(),
  location: z.string().optional(),
  bestSeason: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  thingsIncluded: z.array(z.string()).optional(),
  thingsToBring: z.array(z.string()).optional(),
  mapLocation: z.object({ lat: z.number(), lng: z.number() }).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
const updateActivitySchema = createActivitySchema.partial();

// ---------- Hotel ----------
const roomTypeSchema = z.object({
  name: z.string().min(2),
  maxOccupancy: z.number().int().min(1).optional(),
  pricePerNight: z.number().positive(),
  amenities: z.array(z.string()).optional(),
});
const createHotelSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['Budget', 'Standard', 'Deluxe', 'Boutique', 'Luxury', 'Resort']).optional(),
  starRating: z.number().min(1).max(5).optional(),
  destination: z.string().min(1),
  address: z.string().min(5),
  description: z.string().min(10),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  roomTypes: z.array(roomTypeSchema).optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
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
const createBlogSchema = z.object({
  title: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
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
  createReviewSchema,
  moderateReviewSchema,
  createBlogSchema,
  updateBlogSchema,
};
